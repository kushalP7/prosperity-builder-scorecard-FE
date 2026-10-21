/**
 * Canonical scorecard order configuration based on the Master Excel spreadsheet:
 * 'Prosperity Builder Scorecard TM Master.xlsm'
 */

export const EXCEL_COLUMN_ORDER = [
  'Data',
  'Y(1)/N(0)',
  'Weight (1-4)',
  'Value',
  'Client Total Score',
  'Highest Score',
  'Local Data Result & Notes',
];

export const SECTION_ORDER = [
  "Accessibility & Transportation",
  "Arts & Culture",
  "Crime & Public Safety",
  "Education",
  "Employment & Labor",
  "Goods & Services",
  "Healthcare & Wellness",
  "Historic Preservation",
  "Population & Housing",
  "Housing",
  "Infrastructure",
  "Open Space & Recreation",
  "Planning & Land Use",
];

export const SECTION_CATEGORY_ORDER: Record<string, string[]> = {
  "Accessibility & Transportation": [
    "Major Routes",
    "HH w/o Vehicle",
    "Average commute time",
    "Public transportation options",
    "State transportation funds",
    "Bike and Ped Plan",
  ],
  "Arts & Culture": [
    "Public Art installations",
    "Public Art Map",
    "Cultural facilities",
    "Event Programs",
    "% of employment in Arts, Entertainment Sector",
  ],
  "Crime & Public Safety": [
    "Personal Crime Index",
    "Property Crime Index",
    "Bonus: Officer to Resident Ratio",
    "Crime Rates",
  ],
  "Education": [
    "HS Graduation",
    "College",
    "K-12 Performance",
    "K-12 Chronic Absentism",
    "Secondary Education",
  ],
  "Employment & Labor": [
    "% White Collar Employed",
    "% Blue Collar Employed",
    "% Services Emloyed",
    "Unemployment Rate",
    "Labor Participation",
    "Average HH Income",
    "Median HH Income",
    "Per Capita Income",
    "Certified Pad Ready Sites",
    "Available buildings",
    "Large Employers",
    "BONUS: HQ/Fortune 500/100",
    "Add Entrepreneurship Category",
  ],
  "Goods & Services": [
    "% Employed in Retail Trade",
    "% Employed in Accommodations & Food Services",
    "% Emplyed in Arts, Entertainment & Recreation",
    "Retail Vacancy",
    "Lower vacancy rate, higher score",
    "ADD Tourism Data score",
  ],
  "Healthcare & Wellness": [
    "Hospitals",
    "Clinics, Medical Facilities",
    "County Health Factors",
    "Air Quality Index",
    "Households Below Poverty Level",
    "Access to Healthy Food",
    "% Employed in Healthcare Sector",
  ],
  "Historic Preservation": [
    "Historic Districts",
    "Main St. Designation",
    "Downtown or Main St. Manager",
    "Registered Buildings",
    "Municipal Service or Business Improvement District",
    "Historic Tour Map",
  ],
  "Population & Housing": [
    "Housing Units Renter Occupied",
    "Median Home Value",
    "Median Rent Price",
    "Housing Structure Year Built",
    "Cost Burdened Households",
    "BONUS: Diversity Index",
  ],
  "Housing": [
    "Housing Units Renter Occupied",
    "Median Home Value",
    "Median Rent Price",
    "Housing Structure Year Built",
    "Cost Burdened Households",
    "BONUS: Diversity Index",
  ],
  "Infrastructure": [
    "Public Sewer Capacity",
    "Public Water Capacity",
    "Public Electric Capacity",
    "Broadband Availibility",
    "Expansion Plans",
    "Roadways (STIP)",
    "Water Quality",
    "Emergency Planning",
    "BONUS: Green Energy Alternatives",
  ],
  "Open Space & Recreation": [
    "Recreation Plan",
    "Parks and Rec Director",
    "Greenway",
    "Natural/Recreational Assets",
    "Open Space/Parks",
    "Conservation Ordinances",
    "BONUS: National (2) or State Park (1)",
  ],
  "Planning & Land Use": [
    "Voluntary Agricultural Districts",
    "% Agricultural Employment Sector",
    "% Residential Property Tax Value",
    "% Commercial Property Tax Value",
    "Vacant Land",
    "Tax Exempt Acreage",
    "Comprehensive Land Use Plan",
  ],
};

export const CATEGORY_GROUP_ORDER: Record<string, string[]> = {
  "Major Routes": [
    "Interstate",
    "US Highway",
    "State Highway",
  ],
  "Public transportation options": [
    "Airport",
    "Train",
    "Rapid Bus Transit",
    "City Bus",
    "Trolley/Other",
    "Local Rideshare/Micro Transit",
  ],
  "Public Art installations": [
    "Public Art",
    "Murals",
  ],
  "Cultural facilities": [
    "Arts/Community Center",
    "Museum",
    "Theatre",
    "Event Venues",
  ],
  "College": [
    "Some college",
    "Associates Degree",
    "Bachelor Degree",
    "Graduate/PhD",
  ],
  "Secondary Education": [
    "Community College/Trade School",
    "College/Universities",
    "Quality of Education",
  ],
  "Large Employers": [
    "Large Employers",
    "1000+ Employee",
  ],
};

export function cleanNormalizeString(s?: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function sortSections<T>(sections: T[], getLabel?: (s: T) => string): T[] {
  if (!Array.isArray(sections)) return [];
  const copy = [...sections];
  const extract = getLabel || ((s: any) => s?.label || s?.name || s?.id || '');

  copy.sort((a, b) => {
    const aNorm = cleanNormalizeString(extract(a));
    const bNorm = cleanNormalizeString(extract(b));

    let aIdx = SECTION_ORDER.findIndex(s => {
      const sNorm = cleanNormalizeString(s);
      return aNorm.includes(sNorm) || sNorm.includes(aNorm);
    });
    let bIdx = SECTION_ORDER.findIndex(s => {
      const sNorm = cleanNormalizeString(s);
      return bNorm.includes(sNorm) || sNorm.includes(bNorm);
    });

    if (aIdx === -1) aIdx = 999;
    if (bIdx === -1) bIdx = 999;

    if (aIdx !== bIdx) return aIdx - bIdx;
    return extract(a).localeCompare(extract(b));
  });

  return copy;
}

export function sortCategories<T>(sectionName: string, categories: T[], getLabel?: (c: T) => string): T[] {
  if (!Array.isArray(categories)) return [];
  const copy = [...categories];
  const extract = getLabel || ((c: any) => c?.label || c?.name || '');
  const secNorm = cleanNormalizeString(sectionName);

  const orderEntry = Object.entries(SECTION_CATEGORY_ORDER).find(([k]) => {
    const kNorm = cleanNormalizeString(k);
    return secNorm.includes(kNorm) || kNorm.includes(secNorm);
  });
  const orderList = orderEntry ? orderEntry[1] : [];

  if (orderList.length > 0) {
    copy.sort((a, b) => {
      const aNorm = cleanNormalizeString(extract(a));
      const bNorm = cleanNormalizeString(extract(b));

      let aIdx = orderList.findIndex(o => {
        const oNorm = cleanNormalizeString(o);
        return aNorm.includes(oNorm) || oNorm.includes(aNorm);
      });
      let bIdx = orderList.findIndex(o => {
        const oNorm = cleanNormalizeString(o);
        return bNorm.includes(oNorm) || oNorm.includes(bNorm);
      });

      if (aIdx === -1) aIdx = 999;
      if (bIdx === -1) bIdx = 999;

      if (aIdx !== bIdx) return aIdx - bIdx;
      return extract(a).localeCompare(extract(b));
    });
  }

  return copy;
}

export function sortGroups<T>(categoryLabel: string, groups: T[], getLabel?: (g: T) => string): T[] {
  if (!Array.isArray(groups)) return [];
  const copy = [...groups];
  const extract = getLabel || ((g: any) => g?.label || g?.name || '');
  const catNorm = cleanNormalizeString(categoryLabel);

  const orderEntry = Object.entries(CATEGORY_GROUP_ORDER).find(([k]) => {
    const kNorm = cleanNormalizeString(k);
    return catNorm.includes(kNorm) || kNorm.includes(catNorm);
  });
  const orderList = orderEntry ? orderEntry[1] : [];

  if (orderList.length > 0) {
    copy.sort((a, b) => {
      const aNorm = cleanNormalizeString(extract(a));
      const bNorm = cleanNormalizeString(extract(b));

      let aIdx = orderList.findIndex(o => {
        const oNorm = cleanNormalizeString(o);
        return aNorm.includes(oNorm) || oNorm.includes(aNorm);
      });
      let bIdx = orderList.findIndex(o => {
        const oNorm = cleanNormalizeString(o);
        return bNorm.includes(oNorm) || oNorm.includes(bNorm);
      });

      if (aIdx === -1) aIdx = 999;
      if (bIdx === -1) bIdx = 999;

      if (aIdx !== bIdx) return aIdx - bIdx;
      return extract(a).localeCompare(extract(b));
    });
  }

  return copy;
}

export function sortColumns<T>(columns: T[], getName?: (c: T) => string): T[] {
  if (!Array.isArray(columns)) return [];
  const copy = [...columns];
  const extract = getName || ((c: any) => c?.name || c?.label || '');

  const findColIndex = (val: string) => {
    const vNorm = cleanNormalizeString(val);
    if (!vNorm) return 500;

    // 1. Data Source / Notes column ALWAYS comes LAST
    if (
      vNorm.includes('localdata') ||
      vNorm.includes('datasource') ||
      vNorm.includes('resultnotes') ||
      vNorm.includes('localdatanotes') ||
      vNorm.includes('source') ||
      vNorm.includes('notes')
    ) {
      return 1000;
    }

    // 2. Canonical Excel Scorecard columns
    if (vNorm === 'data' || vNorm === 'basedata') return 0;
    if (vNorm === 'y1n0' || vNorm.includes('yn') || vNorm.includes('yesno')) return 1;
    if (vNorm.includes('weight')) return 2;
    if (vNorm === 'value') return 3;
    if (vNorm.includes('totalscore')) return 4;
    if (vNorm.includes('highestscore') || vNorm.includes('maxscore')) return 5;
    if (vNorm.includes('trend')) return 6;

    // 3. Custom / additional columns come after standard columns but before Data Source / Notes
    return 500;
  };

  copy.sort((a, b) => {
    let aIdx = findColIndex(extract(a));
    let bIdx = findColIndex(extract(b));

    if (aIdx !== bIdx) return aIdx - bIdx;
    return extract(a).localeCompare(extract(b));
  });
  return copy;
}
