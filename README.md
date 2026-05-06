# 💰 Indian Mutual Fund Portfolio Monitor & Analyzer

A comprehensive web application for tracking, analyzing, and visualizing your Indian mutual fund investments with real-time NAV data, performance analytics, and automated alerts.

![Status: Production Ready](https://img.shields.io/badge/status-production--ready-green)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![React: 18.x](https://img.shields.io/badge/react-18.x-61dafb?logo=react)

---

## 🎯 Features

### 📊 Dashboard & Analytics
- **Portfolio Overview**: Real-time portfolio value, gains, and returns
- **Interactive Charts**: 
  - Portfolio growth over time (line chart)
  - Fund allocation breakdown (pie chart)
  - Risk profile visualization
- **Key Metrics**: Total invested, current value, total gain, return percentage
- **Top Performers**: Identify best and worst performing funds

### 💼 Holdings Management
- **Add/Edit Holdings**: Easy form to add or modify fund investments
- **Track Multiple Funds**: Support unlimited mutual fund holdings
- **Key Information**: 
  - AMFI codes
  - Units held
  - Purchase date & NAV
  - Current NAV
  - Auto-calculated current value and returns

### 📈 Performance Analysis
- **Individual Fund Metrics**: Return %, gain/loss, NAV changes
- **Risk Analysis**: Volatility, Sharpe ratio, sector allocation
- **Top Performers Ranking**: Sort funds by return percentage
- **Underperformance Alerts**: Identify struggling investments

### 🔄 NAV Updates
- **Automated Updates**: Fetch latest NAV from AMFI data
- **Batch Updates**: Update all holdings with one click
- **Update History**: Track all NAV changes with timestamps
- **Rate Limiting**: Built-in delays to prevent API throttling

### 🔔 Smart Alerts
- **NAV Change Alerts**: Get notified when NAV changes significantly
- **Performance Alerts**: Alert when funds drop below/above thresholds
- **Milestone Notifications**: Celebrate portfolio milestones
- **Email Integration**: Daily summaries and weekly analysis

### 📱 User Interface
- **Multiple Views**: Dashboard, Holdings, Add Fund, Analysis, Logs
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Auto-adapts to system preferences
- **Real-time Updates**: Instant calculation of metrics

### 🔗 Google Sheets Integration
- **Live Data Sync**: Connect to your Google Sheet
- **Bulk Editing**: Manage holdings in spreadsheet
- **Formula Support**: Auto-calculate returns and metrics
- **Backup & Export**: Always have a backup in Google Sheets

---

## 🚀 Quick Start

### Option 1: Use the React App Directly

1. **Copy the React component** (`mutual_fund_monitor.jsx`)
2. **Paste into your React project**:
   ```bash
   npm install recharts
   ```
3. **Import the component**:
   ```javascript
   import MutualFundMonitor from './mutual_fund_monitor';
   
   export default function App() {
     return <MutualFundMonitor />;
   }
   ```
4. **Start developing**: `npm start`

### Option 2: Deploy to Vercel (Recommended)

1. **Create React App** (if you don't have one):
   ```bash
   npx create-react-app mf-monitor
   cd mf-monitor
   npm install recharts
   ```

2. **Replace App.jsx** with the component code

3. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Share your public URL** and start using!

### Option 3: Use with Glide (No-Code Option)

1. **Create Google Sheet** with your portfolio data
2. **Sign up at** https://www.glideapps.com/
3. **Create new app from Google Sheet**
4. **Add views**:
   - List view for holdings
   - Form to add new funds
   - Summary cards for metrics
   - Charts for visualization
5. **Publish and share**

### Option 4: Google Sheets Only

1. **Create a Google Sheet** with provided template
2. **Add Google Apps Script** for automation
3. **Set up triggers** for daily updates
4. **Use formulas** for all calculations
5. **Create charts** using Google Sheets native features

---

## 📊 Google Sheets Setup

### Create Your Portfolio Sheet

1. **Column Headers**:
   ```
   A: Fund Name
   B: AMFI Code
   C: Units
   D: Purchase Date
   E: Purchase NAV
   F: Current NAV
   G: Amount Invested
   H: Current Value
   I: Gain/Loss
   J: Return %
   ```

2. **Example Formulas**:
   - **G2 (Amount Invested)**: `=C2*E2`
   - **H2 (Current Value)**: `=C2*F2`
   - **I2 (Gain/Loss)**: `=H2-G2`
   - **J2 (Return %)**: `=IF(G2=0,0,(I2/G2)*100)`

3. **Sample Data**:
   ```
   Axis Growth Fund | 113019 | 150 | 2023-01-15 | 45.30 | 58.45
   ICICI Pru Growth | 113018 | 200 | 2023-06-10 | 52.10 | 64.25
   Mirae Emerging   | 113103 | 100 | 2023-03-20 | 48.50 | 62.80
   ```

### Set Up Automated NAV Updates

#### Using Google Apps Script (Recommended):

1. **Open your Google Sheet**
2. **Tools → Script Editor**
3. **Paste the provided `GoogleAppsScript.js`**
4. **Click Deploy → New Deployment**
5. **Create Triggers**:
   - Daily updates at 4:30 PM
   - Daily summary email at 8:00 AM
   - Weekly analysis every Monday at 9:00 AM
6. **Authorize** the script

#### Using AMFI Data:

```googlesheets
=IFERROR(
  VALUE(REGEXEXTRACT(
    IMPORTHTML("https://www.amfiindia.com/spages/NAVAll.txt","B3"),
    "113019.*?(\d+\.\d+)"
  )),
  "Manual Update"
)
```

---

## 🔌 Connecting Your Data

### Method 1: React App + Google Sheets (Full Integration)

```javascript
// In your React component
import { GoogleSpreadsheet } from 'google-spreadsheet';

const syncGoogleSheets = async (sheetId) => {
  const doc = new GoogleSpreadsheet(sheetId);
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo();
  
  const sheet = doc.sheetsByTitle['Portfolio'];
  const rows = await sheet.getRows();
  
  const holdings = rows.map(row => ({
    name: row.get('Fund Name'),
    amfiCode: row.get('AMFI Code'),
    units: parseFloat(row.get('Units')),
    // ... other fields
  }));
  
  return holdings;
};
```

### Method 2: CSV Import

1. **Export CSV** from Google Sheet
2. **Parse in React**:
   ```javascript
   import Papa from 'papaparse';
   
   const handleCSVUpload = (file) => {
     Papa.parse(file, {
       header: true,
       complete: (results) => {
         setHoldings(results.data);
       }
     });
   };
   ```

### Method 3: Manual Data Entry

- Use the "Add Holding" form in the app
- Data saved to browser's local storage
- Export as CSV for backup

---

## 📈 Performance Metrics Explained

### Return %
- **Formula**: `(Current Value - Amount Invested) / Amount Invested × 100`
- **Example**: Invested ₹10,000, Current Value ₹12,000 → Return: 20%

### NAV (Net Asset Value)
- **Definition**: Value of one unit of the mutual fund
- **Tracking**: Monitor NAV changes to understand fund performance
- **Update**: Daily after 4:00 PM IST from AMFI

### XIRR (Extended Internal Rate of Return)
- **Use**: Accounts for timing of investments
- **For SIPs**: Most accurate return calculation
- **Calculation**: Use Excel `=XIRR()` function with cash flows

### Sharpe Ratio
- **Definition**: Risk-adjusted return (Return - Risk-Free Rate) / Volatility
- **Higher is Better**: >1.0 is good, >2.0 is excellent
- **Risk-Free Rate**: Usually RBI's savings deposit rate (~6.5%)

### Volatility (Standard Deviation)
- **Measure**: How much fund value fluctuates
- **Higher**: More risk, more potential return
- **Lower**: More stable, less extreme moves

---

## 🔐 Security & Privacy

### Data Protection
- ✅ All data stored locally in your browser
- ✅ Google Sheets connection uses OAuth 2.0
- ✅ No data sent to third-party servers (except Google)
- ✅ Enable 2FA on your Google account
- ✅ Regularly backup your Google Sheet

### Best Practices
1. **Don't share** spreadsheet links publicly
2. **Use environment variables** for API credentials
3. **Enable version history** in Google Sheets
4. **Backup quarterly** by downloading as Excel file
5. **Review permissions** if sharing with others

---

## 🛠️ Customization

### Add Custom Fund Categories

```javascript
// In the component
const FUND_CATEGORIES = {
  'Large Cap': ['Axis Growth', 'HDFC Top 100'],
  'Mid Cap': ['Mirae Emerging', 'Motilal Oswal Mid Cap'],
  'Small Cap': ['SBI Small Cap', 'Canara Robeco'],
  'Multi Cap': ['Parag Parikh', 'Kotak Standard'],
  'Dividend': ['UTI Dividend Yield']
};
```

### Modify Alert Thresholds

```javascript
// In GoogleAppsScript.js
const CONFIG = {
  ALERT_THRESHOLDS: {
    DOWN_PERFORMANCE: -10,  // Alert if down 10%
    UP_PERFORMANCE: 30,     // Alert if up 30%
    NAV_CHANGE: 5          // Alert if NAV changes 5%
  }
};
```

### Change Update Frequency

```javascript
// In Google Apps Script Triggers:
// - Daily → Change to every 2 days
// - Weekly → Change to every 2 weeks
// - Custom time → Select "Hour timer" and specify time
```

---

## 📚 Data Sources

### Official Sources (Recommended)

| Source | URL | Format | Update Frequency |
|--------|-----|--------|------------------|
| **AMFI** | https://www.amfiindia.com/spages/NAVAll.txt | Text file | Daily at 4:00 PM |
| **Value Research** | https://www.valueresearchonline.com/funds | HTML | Daily |
| **BSE** | https://www.bseindia.com/investors/mutualfund.aspx | HTML | Daily |
| **NSE MFWATCH** | https://www.mfwatch.nseserve.com/mfwatch/ | Web | Real-time |
| **MorningStar** | https://www.morningstar.co.in/funds | HTML | Daily |

### Free APIs to Integrate

1. **AMFI Text Feed** (Best for automation)
   - Parse space-separated values
   - Updated daily after 4:00 PM IST
   - Coverage: All registered mutual funds

2. **Value Research API** (If available)
   - Contact Value Research for API access
   - Includes ratings and analysis
   - Free tier limitations apply

3. **NSE Open Data** (Government source)
   - Check NSE's data portal
   - Official, reliable data
   - Limited API support

---

## 🚢 Deployment Options

### 1. Vercel (Recommended for React)
- **Free Tier**: Perfect for this app
- **Deploy**: `vercel` in terminal
- **Custom Domain**: Yes
- **Performance**: Excellent

### 2. Netlify
- **Free Tier**: 300 build minutes/month
- **Deploy**: Connect GitHub repo
- **Analytics**: Built-in
- **Edge Functions**: Yes

### 3. GitHub Pages
- **Free Tier**: Unlimited
- **Deploy**: `npm run build && npm run deploy`
- **Custom Domain**: Supported
- **Note**: Static only, no backend

### 4. Google Firebase
- **Free Tier**: Generous
- **Deploy**: `firebase deploy`
- **Database**: Firestore available
- **Hosting**: Fast CDN

### 5. Self-Hosted
- **VPS**: DigitalOcean, AWS, Linode
- **Cost**: $5-20/month
- **Control**: Complete
- **Complexity**: Moderate

---

## 📱 Mobile Optimization

The app is fully responsive and works on:
- ✅ iPhones and iPads
- ✅ Android phones and tablets
- ✅ Desktop browsers

### Mobile Tips
1. **Pinch to zoom** on charts
2. **Swipe** between tabs on small screens
3. **Use landscape** for better chart viewing
4. **Add to home screen** for native app feel

---

## 🐛 Troubleshooting

### NAV Updates Not Working
**Problem**: "Error fetching NAV"
**Solution**:
1. Check if AMFI website is accessible
2. Verify internet connection
3. Check Google Apps Script logs
4. Try manual update using Value Research

### Returns Showing as NaN
**Problem**: Calculation error in spreadsheet
**Solution**:
1. Ensure Purchase NAV is a number (not text)
2. Check if Current NAV is populated
3. Verify Units are numeric
4. Re-enter formula in Amount Invested column

### Email Alerts Not Received
**Problem**: No alert emails
**Solution**:
1. Check Gmail "All Mail" folder (not just Inbox)
2. Verify email address in script
3. Check script permissions in Google Account
4. Test with `testSetup()` function

### App Won't Load
**Problem**: Blank page or errors
**Solution**:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Clear browser cache and reload
4. Try different browser
5. Check internet connection

---

## 📞 Support & Resources

### Documentation
- [Google Sheets Help](https://support.google.com/docs/)
- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [React Documentation](https://react.dev/)
- [Recharts Documentation](https://recharts.org/)

### Useful Links
- [AMFI India](https://www.amfiindia.com/) - Official mutual fund data
- [Value Research Online](https://www.valueresearchonline.com/) - Fund research
- [Moneycontrol](https://www.moneycontrol.com/) - News and analysis
- [ETMoney](https://www.etmoney.com/) - Fund tracking

### Community
- Stack Overflow: Tag with `google-apps-script`, `react`, `google-sheets`
- GitHub: Create issue or discussion
- Reddit: r/IndiaInvestments

---

## 📋 Checklist: Getting Started

- [ ] Download/clone all files
- [ ] Create Google Sheet with portfolio data
- [ ] Set up Google Apps Script for automation
- [ ] Create Google Cloud credentials (for API integration)
- [ ] Test React app locally
- [ ] Deploy to Vercel/Netlify/Firebase
- [ ] Connect Google Sheets (optional)
- [ ] Configure email alerts
- [ ] Create scheduled triggers
- [ ] Share app link
- [ ] Start monitoring your portfolio!

---

## 📄 License

MIT License - Free to use, modify, and distribute

---

## 🎉 Features Coming Soon

- [ ] Export to PDF reports
- [ ] Tax reporting (capital gains, loss harvesting)
- [ ] SIP calculator and planner
- [ ] Goal tracking and recommendations
- [ ] Sector-wise allocation visualization
- [ ] Historical performance analysis
- [ ] Mobile app (React Native)
- [ ] Dark theme
- [ ] Multi-currency support
- [ ] Webhook integrations for alerts

---

## 💡 Tips & Tricks

### Maximize Returns
1. **Rebalance Quarterly**: Maintain target allocation
2. **Monitor Underperformers**: Consider switching underperforming funds
3. **Use SIPs**: Regular investment smooths volatility
4. **Review Charges**: Check expense ratios and switch if needed

### Tax Optimization
1. **Tax-Loss Harvesting**: Sell losses to offset gains
2. **Long-term Holdings**: Benefit from indexation benefits
3. **Equity Linked Savings**: Use ELSS for tax deductions
4. **Documentation**: Keep purchase proof for taxation

### Portfolio Management
1. **Diversification**: Mix of large cap, mid cap, small cap
2. **Risk Balance**: Balance equity and debt
3. **Regular Reviews**: Check quarterly performance
4. **Emergency Fund**: Keep 6 months in liquid funds

---

## 🙏 Credits

Built with:
- ⚛️ React 18
- 📊 Recharts for visualization
- 📄 Google Sheets API
- 🔐 Google Apps Script
- 💅 Modern CSS

---

## 📞 Contact & Feedback

Have suggestions or found a bug? 
- Create a GitHub issue
- Email: your-email@example.com
- Tweet: @yourusername

---

**Happy Investing! 📈💰**

Last Updated: May 2026  
Version: 1.0.0
