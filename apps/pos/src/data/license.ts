// Driver-license scan simulation. A real scanner reads the PDF417 barcode on the
// back of the license (AAMVA format); here we expose a few sample "scans" so the
// gate workflow is fully exercisable, including a returning customer, duplicate
// names, a brand-new customer, and an under-21 who must be denied entry.

export interface ScannedLicense {
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  licenseNumber: string;
  address: string;
  expiry: string;
}

export interface SampleScan {
  key: string;
  label: string;
  license: ScannedLicense;
}

export const SAMPLE_SCANS: SampleScan[] = [
  {
    key: "returning-aisha",
    label: "Returning · Aisha Khan",
    license: {
      firstName: "Aisha",
      lastName: "Khan",
      dob: "1995-04-12",
      licenseNumber: "NY-AK-1001",
      address: "44 Maple St, Albany, NY",
      expiry: "2030-04-12",
    },
  },
  {
    key: "returning-john-a",
    label: "Returning · John Carter (1990)",
    license: {
      firstName: "John",
      lastName: "Carter",
      dob: "1990-07-02",
      licenseNumber: "NY-JC-2001",
      address: "9 Birch Ln, Troy, NY",
      expiry: "2029-07-02",
    },
  },
  {
    key: "returning-john-b",
    label: "Returning · John Carter (1988)",
    license: {
      firstName: "John",
      lastName: "Carter",
      dob: "1988-11-23",
      licenseNumber: "NY-JC-2002",
      address: "210 Cedar Ave, Schenectady, NY",
      expiry: "2031-11-23",
    },
  },
  {
    key: "new-adult",
    label: "New · Sam Rivera (age 26)",
    license: {
      firstName: "Sam",
      lastName: "Rivera",
      dob: "1999-02-18",
      licenseNumber: "NY-SR-9001",
      address: "77 Spruce Rd, Albany, NY",
      expiry: "2028-02-18",
    },
  },
  {
    key: "minor",
    label: "Under 21 · Tyler Brooks (age 19)",
    license: {
      firstName: "Tyler",
      lastName: "Brooks",
      dob: "2007-01-30",
      licenseNumber: "NY-TB-9002",
      address: "5 Elm Ct, Troy, NY",
      expiry: "2027-01-30",
    },
  },
];

export function ageFromDob(dob: string, asOf: Date = new Date()): number {
  const birth = new Date(dob + "T00:00:00");
  let age = asOf.getFullYear() - birth.getFullYear();
  const m = asOf.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < birth.getDate())) age--;
  return age;
}

export function isExpired(expiry: string, asOf: Date = new Date()): boolean {
  return new Date(expiry + "T00:00:00") < asOf;
}
