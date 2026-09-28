import { TemplateSection, Project, AnalyticsWidget, TemplateCategory, TemplateColumn, ConditionalRule } from './types';
import { storage } from './storage';

export function addSampleData() {
  const existingTemplates = storage.getTemplates();

  const sectionNames = [
    "Accessibility & Transportation",
    "Arts & Culture",
    "Crime & Public Safety",
    "Education",
    "Employment & Labor",
    "Goods & Services",
    "Healthcare & Wellness",
    "Historic Preservation",
    "Housing",
    "Infrastructure",
    "Open Space & Recreation",
    "Planning & Land Use"
  ];

  const subMetricsMapping: Record<string, string[]> = {
    "Accessibility & Transportation": ['Public Transit Access', 'Pedestrian Infrastructure', 'Bicycle Networks', 'Parking Availability', 'Traffic Flow', 'Road Conditions'],
    "Arts & Culture": ['Galleries & Studios', 'Theaters', 'Public Art Installations', 'Cultural Centers', 'Music Venues', 'Festivals'],
    "Crime & Public Safety": ['Violent Crime Rate', 'Property Crime Rate', 'Police Presence', 'Emergency Response Time', 'Street Lighting', 'Community Policing'],
    "Education": ['Public Schools', 'Private Schools', 'Higher Education', 'Libraries', 'Early Childhood Centers', 'After-School Programs'],
    "Employment & Labor": ['Unemployment Rate', 'Job Growth', 'Major Employers', 'Average Wage', 'Commuting Patterns', 'Workforce Training'],
    "Goods & Services": ['Grocery Stores', 'Retail Centers', 'Pharmacies', 'Banks', 'Restaurants', 'Personal Care Services'],
    "Healthcare & Wellness": ['Hospitals', 'Clinics', 'Pharmacies', 'Mental Health Facilities', 'Fitness Centers', 'Specialty Care'],
    "Historic Preservation": ['Landmarks', 'Districts', 'Monuments', 'Plaques', 'Museums', 'Archives'],
    "Housing": ['Single-Family Homes', 'Multi-Family Units', 'Affordable Housing', 'Rental Rates', 'Home Values', 'Eviction Rates'],
    "Infrastructure": ['Water Supply', 'Sanitation', 'Power Grid', 'Broadband Access', 'Stormwater Management', 'Bridges & Roads'],
    "Open Space & Recreation": ['Parks', 'Trails', 'Playgrounds', 'Sports Fields', 'Recreation Centers', 'Community Gardens'],
    "Planning & Land Use": ['Residential Zoning', 'Commercial Zoning', 'Industrial Zoning', 'Mixed-Use Development', 'Building Permits', 'Vacant Lots']
  };

  const generatedSections: TemplateSection[] = [];
  const projectData: any = {};

  let sectionIndex = 1;
  for (const name of sectionNames) {
    const sectionId = `s_${Date.now()}_${sectionIndex}`;


    // Create the exact 6 requested columns
    const columns: TemplateColumn[] = [
      {
        id: `col_${Date.now()}_${sectionIndex}_yn`,
        name: 'Y(1)/N(0)',
        type: 'number',
        unit: '',
        weight: 1,
        isBonus: false,
        isReadOnly: false,
        formulaExpression: '',
        options: [],
        validation: { min: 0, max: 1 },
        conditionalRules: [],
        scoringRule: { kind: 'manual', maxPoints: 1 }
      },
      {
        id: `col_${Date.now()}_${sectionIndex}_weight`,
        name: 'Weight (1-4)',
        type: 'number',
        unit: '',
        weight: 1,
        isBonus: false,
        isReadOnly: false,
        formulaExpression: '',
        options: [],
        validation: { min: 1, max: 4 },
        conditionalRules: [],
        scoringRule: { kind: 'manual', maxPoints: 4 }
      },
      {
        id: `col_${Date.now()}_${sectionIndex}_value`,
        name: 'Value',
        type: 'number',
        unit: '',
        weight: 1,
        isBonus: false,
        isReadOnly: false,
        formulaExpression: '',
        options: [],
        validation: { min: 0, max: 10 },
        conditionalRules: [],
        scoringRule: { kind: 'manual', maxPoints: 10 }
      },
      {
        id: `col_${Date.now()}_${sectionIndex}_client`,
        name: 'Client Total Score',
        type: 'number',
        unit: '',
        weight: 1,
        isBonus: false,
        isReadOnly: false,
        formulaExpression: '',
        options: [],
        validation: { min: 0, max: 100 },
        conditionalRules: [],
        scoringRule: { kind: 'manual', maxPoints: 10 }
      },
      {
        id: `col_${Date.now()}_${sectionIndex}_highest`,
        name: 'Highest Score',
        type: 'number',
        unit: '',
        weight: 1,
        isBonus: false,
        isReadOnly: false,
        formulaExpression: '',
        options: [],
        validation: { min: 0, max: 100 },
        conditionalRules: [],
        scoringRule: { kind: 'manual', maxPoints: 10 }
      },
      {
        id: `col_${Date.now()}_${sectionIndex}_trend`,
        name: 'Overall Trend',
        type: 'number',
        unit: '',
        weight: 1,
        isBonus: false,
        isReadOnly: false,
        formulaExpression: '',
        options: [],
        validation: { min: 0, max: 20 },
        conditionalRules: [],
        scoringRule: { kind: 'manual', maxPoints: 0 }
      },
      {
        id: `col_${Date.now()}_${sectionIndex}_notes`,
        name: 'Local Data Result & Notes',
        type: 'text',
        unit: '',
        weight: 1,
        isBonus: false,
        isReadOnly: false,
        formulaExpression: '',
        options: [],
        validation: { min: null, max: null },
        conditionalRules: [],
        scoringRule: { kind: 'manual', maxPoints: 0 }
      }
    ];

    const categories: TemplateCategory[] = [];

    let specificRows: any[] | null = null;

    if (name === "Accessibility & Transportation") {
      specificRows = [
        {
          cat: 'Major Routes', rows: [
            { name: '*Interstate If \'Data\' None = 0; 1-2 = 1; <2 = 2', d: '0', yn: null, w: 4, h: 8 },
            { name: 'US Highway If \'Data\' 0-1 = 0; 1-3 = 1; <3 = 2', d: '0', yn: null, w: 3, h: 6 },
            { name: 'State Highway If \'Data\' 0-1 = 0; 1-3 = 1; <3 = 2', d: '0', yn: null, w: 2, h: 4 }
          ]
        },
        {
          cat: 'HH w/o Vehicle', rows: [
            { name: 'HH w/o Vehicle', d: '0.0%', yn: null, w: 3, h: 9 }
          ]
        },
        {
          cat: 'Average commute time', rows: [
            { name: 'Average commute time', d: '0', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: 'Public transportation options', rows: [
            { name: 'Airport', d: '0', yn: 2, w: 4, h: 4 },
            { name: 'Train', d: '0', yn: null, w: 4, h: 4 },
            { name: 'Rapid Bus Transit', d: '0', yn: null, w: 4, h: 4 },
            { name: 'City Bus', d: '0', yn: 3, w: 3, h: 3 },
            { name: 'Trolley/Other', d: '0', yn: 1, w: 2, h: 2 },
            { name: 'Local Rideshare/Micro Transit', d: '0', yn: null, w: 2, h: 2 }
          ]
        },
        {
          cat: 'State transportation funds (# of funded or scheduled STIP projects)', rows: [
            { name: 'State transportation funds (# of funded or scheduled STIP projects)', d: '0', yn: null, w: 4, h: 8 }
          ]
        },
        {
          cat: 'Bike and Ped Plan', rows: [
            { name: 'Bike and Ped Plan', d: '0', yn: 1, w: 3, h: 3 }
          ]
        }
      ];
    } else if (name === "Arts & Culture") {
      specificRows = [
        {
          cat: 'Public Art installations', rows: [
            { name: 'Public Art If none = 0; 1-5 = 1 ; >5 = 2', d: '0', yn: null, w: 3, h: 6 },
            { name: 'Murals If none = 0; 1-5 = 1 ; >5 = 2', d: '0', yn: null, w: 2, h: 4 }
          ]
        },
        {
          cat: 'Public Art Map', rows: [
            { name: 'Public Art Map', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: 'Cultural facilities (Theatre, museum, art, music)', rows: [
            { name: 'Arts/Community Center', d: '0', yn: 1, w: 2, h: 2 },
            { name: 'Museum', d: '0', yn: 1, w: 2, h: 2 },
            { name: 'Theatre', d: '0', yn: 1, w: 2, h: 2 },
            { name: 'Event Venues', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: 'Event Programs (Festivals etc)', rows: [
            { name: 'Event Programs (Festivals etc)', d: '0', yn: null, w: 4, h: 12 }
          ]
        },
        {
          cat: '% of employment in Arts, Entertainment Sector', rows: [
            { name: '% of employment in Arts, Entertainment Sector*', d: '0.0%', yn: null, w: 4, h: 8 }
          ]
        }
      ];
    } else if (name === "Crime & Public Safety") {
      specificRows = [
        {
          cat: 'Personal Crime Index', rows: [
            { name: 'Personal Crime Index', d: '0', yn: null, w: 4, h: 16 }
          ]
        },
        {
          cat: 'Property Crime Index < 100', rows: [
            { name: 'Property Crime Index < 100', d: '0', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: 'Bonus: Officer to Resident Ratio', rows: [
            { name: 'Bonus: Officer to Resident Ratio', d: '0', yn: 1, w: 2, h: 2 }
          ]
        }
      ];
    } else if (name === "Education") {
      specificRows = [
        {
          cat: 'HS Graduation', rows: [
            { name: 'HS Graduation', d: '0', yn: null, w: 2, h: 2 }
          ]
        },
        {
          cat: 'College', rows: [
            { name: 'Some college, no degree', d: '0', yn: null, w: 2, h: 2 },
            { name: 'Associates Degree', d: '0', yn: null, w: 3, h: 3 },
            { name: 'Bachelor Degree', d: '0', yn: null, w: 4, h: 4 },
            { name: 'Graduate/PhD', d: '0', yn: null, w: 4, h: 4 }
          ]
        },
        {
          cat: 'K-12 Performance (Low Performing Schools)', rows: [
            { name: 'K-12 Performance (Low Performing Schools)', d: '0', yn: null, w: 4, h: 16 }
          ]
        },
        {
          cat: 'K-12 Chronic Absentism', rows: [
            { name: 'K-12 Chronic Absentism', d: '0', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: 'Secondary Education', rows: [
            { name: 'Community College/Trade School', d: '0', yn: null, w: 3, h: 6 },
            { name: 'College/Universities', d: '0', yn: null, w: 4, h: 8 }
          ]
        }
      ];
    } else if (name === "Employment & Labor") {
      specificRows = [
        {
          cat: '% White Collar Employed', rows: [
            { name: '% White Collar Employed', d: '0.0%', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: '% Blue Collar Employed', rows: [
            { name: '% Blue Collar Employed', d: '0.0%', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: '% Services Employed', rows: [
            { name: '% Services Employed', d: '0.0%', yn: null, w: 2, h: 4 }
          ]
        },
        {
          cat: 'Unemployment Rate', rows: [
            { name: 'Unemployment Rate*', d: '0.0%', yn: null, w: 3, h: 9 }
          ]
        },
        {
          cat: 'Labor Participation', rows: [
            { name: 'Labor Participation', d: '0.0%', yn: null, w: 4, h: 16 }
          ]
        },
        {
          cat: 'Average HH Income', rows: [
            { name: 'Average HH Income', d: '$0', yn: null, w: 2, h: 8 }
          ]
        },
        {
          cat: 'Median HH Income', rows: [
            { name: 'Median HH Income', d: '$0', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: 'Per Capita Income', rows: [
            { name: 'Per Capita Income', d: '$0', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: 'Certified Pad Ready Sites', rows: [
            { name: 'Certified Pad Ready Sites', d: '0', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: 'Available buildings > 5000 SF', rows: [
            { name: 'Available buildings > 5000 SF', d: '0', yn: null, w: 2, h: 4 }
          ]
        },
        {
          cat: 'Large Employers', rows: [
            { name: '500+ Employee Businesses', d: '0', yn: null, w: 3, h: 12 },
            { name: '1000+ Employee Businesses', d: '0', yn: null, w: 4, h: 16 }
          ]
        },
        {
          cat: 'BONUS: HQ/Fortune 500/100', rows: [
            { name: 'BONUS: HQ/Fortune 500/100', d: '0', yn: 1, w: 4, h: 4 }
          ]
        }
      ];
    } else if (name === "Goods & Services") {
      specificRows = [
        {
          cat: '% Employed in Retail Trade', rows: [
            { name: '% Employed in Retail Trade', d: '0.0%', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: '% Employed in Accommodations & Food Services', rows: [
            { name: '% Employed in Accommodations & Food Services', d: '0.0%', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: '% Employed in Arts, Entertainment & Recreation', rows: [
            { name: '% Employed in Arts, Entertainment & Recreation', d: '0.0%', yn: null, w: 2, h: 4 }
          ]
        },
        {
          cat: 'Retail Vacancy', rows: [
            { name: 'Retail Vacancy', d: '0.0%', yn: null, w: 4, h: 16 }
          ]
        }
      ];
    } else if (name === "Healthcare & Wellness") {
      specificRows = [
        {
          cat: 'Hospitals', rows: [
            { name: 'US is 2.9 beds per 1,000 persons', d: '0', yn: null, w: 4, h: 4 }
          ]
        },
        {
          cat: 'Clinics, Medical Facilities', rows: [
            { name: 'Clinics, Medical Facilities', d: '0', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: 'County Health Factors', rows: [
            { name: 'County Health Factors', d: '0', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: 'Air Quality Index', rows: [
            { name: 'Air Quality Index', d: '0', yn: null, w: 2, h: 8 }
          ]
        },
        {
          cat: 'Households Below Poverty Level', rows: [
            { name: 'Households Below Poverty Level (ACS 5 Year - 2021)', d: '0.0%', yn: null, w: 4, h: 16 }
          ]
        },
        {
          cat: 'Access to Healthy Food', rows: [
            { name: 'Access to Healthy Food', d: '0', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: '% Employed in Healthcare Sector', rows: [
            { name: '% Employed in Healthcare Sector', d: '0.0%', yn: null, w: 3, h: 6 }
          ]
        }
      ];
    } else if (name === "Historic Preservation") {
      specificRows = [
        {
          cat: 'Historic Districts', rows: [
            { name: 'Historic Districts', d: '0', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: 'Main St. Designation', rows: [
            { name: 'Main St. Designation', d: '0', yn: 1, w: 3, h: 3 }
          ]
        },
        {
          cat: 'Downtown or Main St. Manager', rows: [
            { name: 'Downtown or Main St. Manager', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: 'Registered Buildings', rows: [
            { name: 'Registered Buildings', d: '0', yn: null, w: 1, h: 2 }
          ]
        },
        {
          cat: 'Municipal Service or Business Improvement District', rows: [
            { name: 'Municipal Service or Business Improvement District', d: '0', yn: null, w: 1, h: 2 }
          ]
        },
        {
          cat: 'Historic Tour Map', rows: [
            { name: 'Historic Tour Map', d: '0', yn: 1, w: 2, h: 2 }
          ]
        }
      ];
    } else if (name === "Housing") {
      specificRows = [
        {
          cat: 'Housing Units Renter Occupied', rows: [
            { name: 'Housing Units Renter Occupied', d: '0.0%', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: 'Median Home Value', rows: [
            { name: 'Median Home Value', d: '$0', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: '*Median Rent Price', rows: [
            { name: '*Median Rent Price', d: '$0', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: 'Housing Structure Year Built', rows: [
            { name: 'Housing Structure Year Built', d: '0.0%', yn: null, w: 3, h: 12 }
          ]
        },
        {
          cat: 'Cost Burdened Households', rows: [
            { name: 'Cost Burdened Households', d: '0.0%', yn: null, w: 4, h: 12 }
          ]
        },
        {
          cat: 'BONUS: Diversity Index', rows: [
            { name: 'BONUS: Diversity Index', d: '0', yn: null, w: 3, h: 3 }
          ]
        }
      ];
    } else if (name === "Infrastructure") {
      specificRows = [
        {
          cat: 'Public Sewer Capacity', rows: [
            { name: 'Public Sewer Capacity', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: 'Public Water Capacity', rows: [
            { name: 'Public Water Capacity', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: 'Public Electric Capacity', rows: [
            { name: 'Public Electric Capacity', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: 'Broadband Availibility', rows: [
            { name: 'Broadband Availibility', d: '0', yn: null, w: 2, h: 8 }
          ]
        },
        {
          cat: 'Expansion Plans', rows: [
            { name: 'Expansion Plans', d: '0', yn: 1, w: 3, h: 3 }
          ]
        },
        {
          cat: 'Roadways (STIP)', rows: [
            { name: 'Roadways (STIP)', d: '0', yn: null, w: 1, h: 4 }
          ]
        },
        {
          cat: 'Water Quality (Stormwater)', rows: [
            { name: 'Water Quality (Stormwater)', d: '0', yn: null, w: 2, h: 8 }
          ]
        },
        {
          cat: 'Emergency Planning', rows: [
            { name: 'Emergency Planning', d: '0', yn: 1, w: 1, h: 1 }
          ]
        },
        {
          cat: 'BONUS: Green Energy Alternatives', rows: [
            { name: 'BONUS: Green Energy Alternatives', d: '0', yn: 1, w: 3, h: 3 }
          ]
        }
      ];
    } else if (name === "Open Space & Recreation") {
      specificRows = [
        {
          cat: 'Recreation Plan', rows: [
            { name: 'Recreation Plan', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: 'Parks and Rec Director', rows: [
            { name: 'Parks and Rec Director', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: 'Greenway', rows: [
            { name: 'Greenway', d: '0', yn: null, w: 3, h: 9 }
          ]
        },
        {
          cat: 'Natural/Recreational Assets', rows: [
            { name: 'Natural/Recreational Assets', d: '0', yn: null, w: 2, h: 6 }
          ]
        },
        {
          cat: 'Open Space/Parks', rows: [
            { name: 'Open Space/Parks', d: '0', yn: null, w: 3, h: 9 }
          ]
        },
        {
          cat: 'Conservation Ordinances', rows: [
            { name: 'Conservation Ordinances', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: 'BONUS: National (2) or State Park (1)', rows: [
            { name: 'BONUS: National (2) or State Park (1)', d: '0', yn: null, w: 3, h: 3 }
          ]
        }
      ];
    } else if (name === "Planning & Land Use") {
      specificRows = [
        {
          cat: 'Voluntary Agricultural Districts (VAD) or (EVAD)', rows: [
            { name: 'Voluntary Agricultural Districts (VAD) or (EVAD)', d: '0', yn: 1, w: 2, h: 2 }
          ]
        },
        {
          cat: '% Agricultural Employment Sector', rows: [
            { name: '% Agricultural Employment Sector', d: '0.0%', yn: null, w: 2, h: 4 }
          ]
        },
        {
          cat: '% Residential Property Tax Value', rows: [
            { name: '% Residential Property Tax Value', d: '0.0%', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: '% Commercial Property Tax Value', rows: [
            { name: '% Commercial Property Tax Value', d: '0.0%', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: 'Vacant Land (acres)', rows: [
            { name: 'Vacant Land (acres)', d: '0.0%', yn: null, w: 3, h: 6 }
          ]
        },
        {
          cat: 'Tax Exempt Acreage', rows: [
            { name: 'Tax Exempt Acreage (institutions, churches, schools)', d: '0', yn: null, w: 2, h: 4 }
          ]
        },
        {
          cat: 'Comprehensive Land Use Plan', rows: [
            { name: 'Comprehensive Land Use Plan', d: 'Y (2018)', yn: null, w: 4, h: 12 }
          ]
        }
      ];
    }

    if (specificRows) {
      specificRows.forEach((catObj, cIdx) => {
        const catId = `c_${Date.now()}_${sectionIndex}_${cIdx}`;
        const groups = catObj.rows.map((r: any, rIdx: number) => ({
          id: `g_${Date.now()}_${sectionIndex}_${cIdx}_${rIdx}`,
          label: r.name,
          takesValues: false,
          columns: []
        }));

        categories.push({
          id: catId,
          label: catObj.cat,
          takesValues: false,
          groups,
          columns
        });

        catObj.rows.forEach((r: any, rIdx: number) => {
          const isYn = r.yn !== null;
          const maxValAllowed = Math.max(1, r.h / r.w);

          // Generate Y/N (0 or 1)
          const randYn = Math.random() > 0.2 ? 1 : 0;

          const baseVal = Math.random();
          const randVal = Math.min(maxValAllowed, Math.max(1, Math.floor(baseVal * maxValAllowed * 0.6 + maxValAllowed * 0.4)));

          // Calculate strict client score: y(1)/n(0) * weight, bounded to 10 max
          const rawClientTotal = isYn ? (randYn * r.w) : (randVal * r.w);
          const randClientTotal = Math.min(10, rawClientTotal);

          // Highest score must be a random data between 0-10, but NEVER lower than the client score
          const randHighest = Math.min(10, Math.max(randClientTotal, Math.floor(Math.random() * 11)));

          // Generate raw whole number between 0 and 100 for Data column
          const dataBaseValue = Math.floor(Math.random() * 101);

          const trendVal = Math.floor(5 + (randClientTotal * 0.5) + (Math.random() * 2));

          projectData[groups[rIdx].id] = {
            '__base__': { value: dataBaseValue },
            [columns[0].id]: { value: isYn ? randYn : null },
            [columns[1].id]: { value: r.w },
            [columns[2].id]: { value: randVal },
            [columns[3].id]: { value: randClientTotal },
            [columns[4].id]: { value: randHighest },
            [columns[5].id]: { value: trendVal },
            [columns[6].id]: { value: 'Verified locally' }
          };
        });
      });
    } else {
      const catId = `c_${Date.now()}_${sectionIndex}_1`;
      const subMetrics = subMetricsMapping[name] || ['Sub-Category 1', 'Sub-Category 2', 'Sub-Category 3'];

      const groups = subMetrics.map((metricName, z) => ({
        id: `g_${Date.now()}_${sectionIndex}_1_${z}`,
        label: metricName,
        takesValues: false,
        columns: []
      }));

      categories.push({
        id: catId,
        label: `Overview`,
        takesValues: false,
        groups,
        columns
      });

      for (const group of groups) {
        const dataVal = Math.floor(Math.random() * 101);
        const yn = Math.random() > 0.2 ? 1 : 0;
        const weight = Math.floor(Math.random() * 4) + 1; // 1 to 4
        const val = Math.floor(Math.random() * 3 + 2); // 2 to 4

        // Target a section score strictly between 5.0 and 7.0
        const highest = 10;
        const targetScore = 5.0 + Number((Math.random() * 2.0).toFixed(1)); // 5.0 to 7.0
        const clientTotal = Number(targetScore.toFixed(1));

        // Seed a realistic trend
        const trendVal = Math.floor(5 + (clientTotal * 0.5) + (Math.random() * 2));

        projectData[group.id] = {
          '__base__': { value: dataVal },
          [columns[0].id]: { value: yn },
          [columns[1].id]: { value: weight },
          [columns[2].id]: { value: val },
          [columns[3].id]: { value: clientTotal },
          [columns[4].id]: { value: highest },
          [columns[5].id]: { value: trendVal },
          [columns[6].id]: { value: 'Verified locally' }
        };
      }
    }

    generatedSections.push({
      id: sectionId,
      label: name,
      categories
    });

    sectionIndex++;
  }

  // Push sections to storage
  existingTemplates.push(...generatedSections);
  storage.saveTemplates(existingTemplates);

  // Generate widgets dynamically
  const widgets: AnalyticsWidget[] = [];
  const chartTypes: any[] = ['bar_chart', 'pie_chart', 'area_chart', 'donut_chart', 'radar_chart', 'line_chart'];

  generatedSections.forEach((sec, idx) => {
    // The first category's columns are representative of the whole section
    const firstCategory = sec.categories[0];

    // 1 Stat Card per section (Point to Client Total Score)
    widgets.push({
      id: `w_${Date.now()}_stat_${idx}`,
      title: `${sec.label} Score`,
      chartType: 'stat_card',
      sectionId: sec.id,
      categoryId: '',
      columnId: firstCategory.columns[3].id, // Client Total Score
      aggregation: 'average'
    });

    // 1 Main Chart per section (Point to Value breakdown)
    const type1 = chartTypes[idx % chartTypes.length];
    widgets.push({
      id: `w_${Date.now()}_chart1_${idx}`,
      title: `${sec.label} Value Overview`,
      chartType: type1,
      sectionId: sec.id,
      categoryId: '',
      columnId: firstCategory.columns[2].id, // Value
      aggregation: 'sum'
    });

    // 1 Additional Analytical Chart per section (Point to Client Total Score breakdown)
    // Offset the index so it doesn't match type1
    const type2 = chartTypes[(idx + 2) % chartTypes.length];
    widgets.push({
      id: `w_${Date.now()}_chart2_${idx}`,
      title: `${sec.label} Score Breakdown`,
      chartType: type2,
      sectionId: sec.id,
      categoryId: '',
      columnId: firstCategory.columns[3].id, // Client Total Score
      aggregation: 'sum'
    });
  });

  const existingWidgets = storage.getWidgets();
  existingWidgets.push(...widgets);
  storage.saveWidgets(existingWidgets);

  const existingProjects = storage.getProjects();
  const existingNames = new Set(existingProjects.map(p => p.name));

  const sampleProjectPool = [
    { name: "Metropolis Master Plan 2026", clientName: "City of Metropolis", year: 2026 },
    { name: "Metropolis Pro Plan 2026", clientName: "City of Metropolis", year: 2026 },
    { name: "Hudson Yards Vision 2026", clientName: "NYC Economic Development Corp", year: 2026 },
    { name: "Riverside Gateway Master Plan 2026", clientName: "Riverside Development Auth", year: 2026 },
    { name: "Midtown Innovation District 2026", clientName: "Midtown Commerce Alliance", year: 2026 },
    { name: "Harbor View Revitalization 2026", clientName: "Harbor Port Authority", year: 2026 },
    { name: "Beacon Hill Urban Core 2026", clientName: "Boston Planning Board", year: 2026 },
    { name: "Oakland Civic Hub 2026", clientName: "Oakland Redevelopment Agency", year: 2026 },
    { name: "Downtown Mobility Core 2026", clientName: "Dept of Transit & Urban Ops", year: 2026 }
  ];

  let selectedProject = sampleProjectPool.find(p => !existingNames.has(p.name));

  if (!selectedProject) {
    let count = existingProjects.length + 1;
    let uniqueName = `Metropolis Master Plan 2026 (#${count})`;
    while (existingNames.has(uniqueName)) {
      count++;
      uniqueName = `Metropolis Master Plan 2026 (#${count})`;
    }
    selectedProject = {
      name: uniqueName,
      clientName: "City of Metropolis",
      year: 2026
    };
  }

  // Create Project
  const masterProject: Project = {
    id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: selectedProject.name,
    clientName: selectedProject.clientName,
    year: selectedProject.year,
    enabledWidgets: widgets.map(w => w.id),
    assignedSections: generatedSections,
    data: projectData
  };

  storage.saveProject(masterProject);
}

export async function handleLoadSampleData() {
  const { toast } = await import('@/components/ui/toast');
  toast.loading("Loading sample data...");
  const { apiClient } = await import('@/lib/api');
  const apiSuccess = await apiClient.loadSampleData();

  if (apiSuccess) {
    toast.success("Sample data loaded from NestJS Backend server!");
  } else {
    toast.error("Failed to load sample data from server.");
  }

  const { useAppStore } = await import('@/store');
  await useAppStore.getState().initialize();
}
