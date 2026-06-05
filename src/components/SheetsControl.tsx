import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from '../utils/firebaseAuth';
import { 
  createAndExportSpreadsheet, 
  ExportData 
} from '../utils/googleSheetsExporter';
import { 
  FileSpreadsheet, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  CloudRain, 
  User as UserIcon, 
  LogOut, 
  HelpCircle, 
  RefreshCw, 
  Check, 
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ClipboardCheck,
  PiggyBank,
  Wrench,
  Users
} from 'lucide-react';
import { Property, Room, Tenant, Transaction, Complaint, PaymentReceipt } from '../types';

interface SheetsControlProps {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  transactions: Transaction[];
  complaints: Complaint[];
  receipts: PaymentReceipt[];
}

export default function SheetsControl({
  properties,
  rooms,
  tenants,
  transactions,
  complaints,
  receipts
}: SheetsControlProps) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Form customisation state
  const [spreadsheetName, setSpreadsheetName] = useState<string>(() => {
    const formattedDate = new Date().toISOString().split('T')[0];
    return `MudaKost Landlord Report - ${formattedDate}`;
  });
  
  // Tab checkboxes state
  const [includeOverview, setIncludeOverview] = useState<boolean>(true);
  const [includeRooms, setIncludeRooms] = useState<boolean>(true);
  const [includeTenants, setIncludeTenants] = useState<boolean>(true);
  const [includeFinance, setIncludeFinance] = useState<boolean>(true);
  const [includeIssues, setIncludeIssues] = useState<boolean>(true);

  // Export action state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportStep, setExportStep] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    filename: string;
  } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Initialize auth state integration
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setIsLoadingAuth(false);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setIsLoadingAuth(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      setExportError(null);
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sheets Sign In Error:', err);
      setExportError(err.message || 'Failed to authenticate with Google. Ensure you grant permission.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    if (window.confirm('Do you want to log out from Google Sheets integration? your active token will be securely cleared.')) {
      try {
        await logout();
        setCurrentUser(null);
        setAccessToken(null);
        setExportSuccess(null);
        setExportError(null);
      } catch (err: any) {
        console.error('Google Sign Out error:', err);
      }
    }
  };

  const handleTriggerExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setExportError('You must sign in with Google to grant spreadsheet edit permissions.');
      return;
    }

    // Least-privilege explicit confirmation matching workspace Integration Guideline
    const activeTabsCount = [includeOverview, includeRooms, includeTenants, includeFinance, includeIssues].filter(Boolean).length;
    if (activeTabsCount === 0) {
      alert('Please select at least one data tab to include in your spreadsheet export.');
      return;
    }

    const isConfirmed = window.confirm(
      `Confirm Export to Google Sheets:\n\n` +
      `We will create a brand new Google Spreadsheet named "${spreadsheetName}" inside your Google Drive containing ${activeTabsCount} customized tabs. This will not modify any existing Google Sheets files.`
    );
    if (!isConfirmed) return;

    try {
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(null);

      setExportStep('Initializing Google Sheets Service client...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setExportStep('Creating spreadsheet workbook container...');
      
      // Filter states matching user customization selection
      const exportObject: ExportData = {
        properties,
        rooms: includeRooms ? rooms : [],
        tenants: includeTenants ? tenants : [],
        transactions: includeFinance ? transactions : [],
        complaints: includeIssues ? complaints : [],
        receipts: includeFinance ? receipts : []
      };

      setExportStep('Writing rows and values into sheets sheets...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setExportStep('Formatting layouts, themes, headers and bold boundaries...');
      const result = await createAndExportSpreadsheet(
        accessToken,
        spreadsheetName,
        exportObject
      );

      setExportStep('Synchronizing with Google and wrapping up files...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setExportSuccess({
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        filename: spreadsheetName
      });
    } catch (err: any) {
      console.error('Spreadsheet export exception:', err);
      setExportError(err.message || 'An error occurred during writing spreadsheet cells to Google Sheets.');
    } finally {
      setIsExporting(false);
      setExportStep('');
    }
  };

  return (
    <div className="space-y-6" id="sheets-control-panel">
      {/* Upper Title Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-soft-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-forest-600" /> Google Sheets Integration Engine
          </h2>
          <p className="text-xs text-soft-500 mt-1">
            Securely link live MudaKost room statuses, renters inventories, and financial ledger data to external spreadsheets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Authentication Status and Info panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sign In State Block */}
          <div className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-soft-450 border-b border-soft-100 pb-3 mb-4 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-forest-600" /> Authorization credentials
            </h3>

            {isLoadingAuth ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 text-forest-500 animate-spin" />
                <span className="text-xs text-soft-500 font-medium font-mono">Checking cloud auth status...</span>
              </div>
            ) : currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-forest-50/50 p-4 rounded-xl border border-forest-100">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Google avatar" 
                      className="w-10 h-10 rounded-full border-2 border-forest-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-forest-200 text-forest-800 flex items-center justify-center font-bold text-sm">
                      {currentUser.displayName?.charAt(0) || 'L'}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-soft-900 truncate">{currentUser.displayName || 'MudaKost User'}</h4>
                    <p className="text-[10px] text-soft-450 font-mono truncate">{currentUser.email || 'Authorised Provider'}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-205 rounded-xl flex items-start gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Sheets Channel Active</h5>
                    <p className="text-[10px] text-emerald-700 leading-relaxed mt-1">
                      MudaKost is authenticated to safely create, structure, style, and populate new spreadsheets in your Google Account.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  className="w-full py-2.5 px-4 bg-soft-50 hover:bg-soft-100 text-soft-600 text-xs font-bold rounded-lg transition border border-soft-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-4 h-4" /> Disconnect Google Account
                </button>
              </div>
            ) : (
              <div className="space-y-4 py-3">
                <p className="text-xs text-soft-550 leading-relaxed">
                  Sign in with your Google Workspace or Gmail Account to construct formatted reports. You must grant permission to save and update files inside your Google Drive.
                </p>

                {/* Styled Native Sign In With Google Match Guideline Style */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-soft-50/70 text-soft-800 font-bold py-3 px-4 border border-soft-200 rounded-xl text-xs transition duration-250 cursor-pointer shadow-xs disabled:opacity-55"
                >
                  {isSigningIn ? (
                    <RefreshCw className="w-4 h-4 text-soft-500 animate-spin" />
                  ) : (
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4.5 h-4.5 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  )}
                  <span>{isSigningIn ? 'Connecting to Accounts...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Guidelines info card */}
          <div className="bg-soft-50 p-5 rounded-2xl border border-soft-200">
            <h4 className="text-xs font-bold text-soft-850 flex items-center gap-1.5 mb-2.5">
              <HelpCircle className="w-4 h-4 text-forest-600" /> Exporting Guidelines
            </h4>
            <ul className="text-[11px] text-soft-500 space-y-2 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-forest-600 font-bold shrink-0">•</span>
                <span><strong>No Overwriting Safe</strong>: Each execution generates a brand new document so your previous exports remain permanently untouched.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-forest-600 font-bold shrink-0">•</span>
                <span><strong>Formatted Sheets Layout</strong>: We automatically bold columns headers, freeze row 1, set color themes, and configure default filters for readability.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-forest-600 font-bold shrink-0">•</span>
                <span><strong>Real-time Synchronized</strong>: The export compiles current live data saved in your browser, perfect for offline reporting.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Setup form, customizing checkboxes and exports status notifications */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleTriggerExport} className="bg-white p-6 rounded-2xl border border-soft-200 shadow-xs space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-soft-450 border-b border-soft-100 pb-3 mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-forest-600" /> Spreadsheet customizer configuration
            </h3>

            {/* Input field for Spreadsheet workbook name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-soft-700 block">Spreadsheet Title/Filename *</label>
              <input
                type="text"
                required
                disabled={!currentUser || isExporting}
                value={spreadsheetName}
                onChange={(e) => setSpreadsheetName(e.target.value)}
                placeholder="e.g. MudaKost Landlord Report - June 2026"
                className="w-full text-xs px-3.5 py-3 bg-soft-50 border border-soft-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-forest-500 disabled:opacity-50"
              />
              <p className="text-[10px] text-soft-400">Specify an intuitive name for the worksheet. It will be searchable in your Google Drive.</p>
            </div>

            {/* Tab customize checkbox grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-soft-700 block">Select Tabs / Datasets to include *</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Checkbox Overview Summary */}
                <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                  !currentUser ? 'opacity-40 select-none' : 'hover:bg-soft-50/50'
                } ${includeOverview && currentUser ? 'border-forest-200 bg-forest-50/20' : 'border-soft-200 bg-white'}`}>
                  <input
                    type="checkbox"
                    disabled={!currentUser || isExporting}
                    checked={includeOverview}
                    onChange={(e) => setIncludeOverview(e.target.checked)}
                    className="mt-1 accent-forest-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-soft-808 flex items-center gap-1.5">
                      <ClipboardCheck className="w-3.5 h-3.5 text-forest-600" /> Overview & Summary
                    </span>
                    <p className="text-[10px] text-soft-450 mt-1">Generates key metrics like occupancy levels, pending complaints count, and total financials summary.</p>
                  </div>
                </label>

                {/* Checkbox Rooms Specs */}
                <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                  !currentUser ? 'opacity-40 select-none' : 'hover:bg-soft-50/50'
                } ${includeRooms && currentUser ? 'border-forest-200 bg-forest-50/20' : 'border-soft-200 bg-white'}`}>
                  <input
                    type="checkbox"
                    disabled={!currentUser || isExporting}
                    checked={includeRooms}
                    onChange={(e) => setIncludeRooms(e.target.checked)}
                    className="mt-1 accent-forest-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-soft-808 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-forest-600" /> Venue & Rooms Specs
                    </span>
                    <p className="text-[10px] text-soft-450 mt-1">Exports all rooms breakdown with floor mappings, deluxe/suite type labels, monthly rate, and status.</p>
                  </div>
                </label>

                {/* Checkbox Tenants */}
                <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                  !currentUser ? 'opacity-40 select-none' : 'hover:bg-soft-50/50'
                } ${includeTenants && currentUser ? 'border-forest-200 bg-forest-50/20' : 'border-soft-200 bg-white'}`}>
                  <input
                    type="checkbox"
                    disabled={!currentUser || isExporting}
                    checked={includeTenants}
                    onChange={(e) => setIncludeTenants(e.target.checked)}
                    className="mt-1 accent-forest-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-soft-808 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-forest-600" /> Active Tenants Roster
                    </span>
                    <p className="text-[10px] text-soft-450 mt-1">Exports the registered occupants roster with phone nos, emails, rent periods, and warning alerts.</p>
                  </div>
                </label>

                {/* Checkbox Financial Ledger */}
                <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                  !currentUser ? 'opacity-40 select-none' : 'hover:bg-soft-50/50'
                } ${includeFinance && currentUser ? 'border-forest-200 bg-forest-50/20' : 'border-soft-200 bg-white'}`}>
                  <input
                    type="checkbox"
                    disabled={!currentUser || isExporting}
                    checked={includeFinance}
                    onChange={(e) => setIncludeFinance(e.target.checked)}
                    className="mt-1 accent-forest-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-soft-808 flex items-center gap-1.5">
                      <PiggyBank className="w-3.5 h-3.5 text-forest-600" /> Financial Ledger
                    </span>
                    <p className="text-[10px] text-soft-450 mt-1">Exports all historic transactions (income, expenses, staff wages) with category tags and description details.</p>
                  </div>
                </label>

                {/* Checkbox Complaints */}
                <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                  !currentUser ? 'opacity-40 select-none' : 'hover:bg-soft-50/50 block md:col-span-2'
                } ${includeIssues && currentUser ? 'border-forest-200 bg-forest-50/20 md:col-span-2' : 'border-soft-200 bg-white md:col-span-2'}`}>
                  <input
                    type="checkbox"
                    disabled={!currentUser || isExporting}
                    checked={includeIssues}
                    onChange={(e) => setIncludeIssues(e.target.checked)}
                    className="mt-1 accent-forest-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-soft-808 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-forest-600" /> Maintenance & Grievances
                    </span>
                    <p className="text-[10px] text-soft-450 mt-1">Exports tenant maintenance requests, logged titles, unresolved issues logs, dates filed, and prioritizations.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Error messaging strip */}
            {exportError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 animate-bounce">
                <span className="font-bold">Error:</span>
                <p className="flex-1 leading-relaxed">{exportError}</p>
              </div>
            )}

            {/* Loading / Writing step notification banner */}
            {isExporting && (
              <div className="p-5 bg-soft-50 rounded-xl border border-soft-200 flex items-center gap-4">
                <RefreshCw className="w-5 h-5 text-forest-600 animate-spin shrink-0" />
                <div className="space-y-1 overflow-hidden">
                  <h4 className="text-xs font-bold text-soft-950 font-mono">Running Cloud Operation...</h4>
                  <p className="text-[11px] text-soft-500 animate-pulse truncate font-mono">{exportStep}</p>
                </div>
              </div>
            )}

            {/* Export Success Banner */}
            {exportSuccess && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3.5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 leading-none">Spreadsheet Export Complete!</h4>
                    <p className="text-[11px] text-emerald-700 leading-relaxed mt-1.5">
                      Spreadsheet file <strong>"{exportSuccess.filename}"</strong> has been successfully instantiated and populated in your Google Directory. Theme parameters, basic filters, and table widths are fully configured.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1 font-mono">
                  <a
                    href={exportSuccess.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition duration-200 text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" /> Open In Google Sheets
                  </a>
                  <div className="bg-emerald-100 text-emerald-800 text-[10px] py-3 px-4 rounded-xl flex items-center justify-center border border-emerald-250 truncate">
                    ID: {exportSuccess.spreadsheetId.substring(0, 10)}...{exportSuccess.spreadsheetId.substring(exportSuccess.spreadsheetId.length - 6)}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action button trigger */}
            <div className="pt-2">
              {currentUser ? (
                <button
                  type="submit"
                  disabled={isExporting}
                  className="w-full bg-forest-300 hover:bg-forest-400 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-xs transition duration-200 cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" /> 
                  {isExporting ? 'Exporting Active Ledger...' : 'Build & Export to Google Sheets'}
                </button>
              ) : (
                <div className="p-4 bg-soft-50 rounded-xl border border-soft-200 border-dashed text-center">
                  <div className="text-xs text-soft-500 font-medium">
                    🔓 Google Sheets connection locked. Please Sign in with Google first.
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
