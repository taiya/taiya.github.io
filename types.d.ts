/**
 * A single publication entry from data/pubs.json.
 */
interface Publication {
  key: string;
  type: string;
  title: string;
  /** Comma-separated array stored as string[] in JSON */
  authors: string[];
  year: string;
  venue?: string;
  /** Short badge text, e.g. "ICLR'26" */
  special?: string;
  /** URL to a thumbnail image or .mov video */
  icon?: string;
  pdf?: string;
  arxiv?: string;
  video?: string;
  slides?: string;
  source?: string;
  datasets?: string;
  media?: string;
  homepage?: string;
  /** Patent-specific */
  number?: string;
  filed?: string;
  notes?: string[];
}

/**
 * A single person entry (student or alumni) from data/people.json.
 */
interface Person {
  name: string;
  degree: string;
  time: string;
  currently: string;
  homepage: string;
  coadvisors?: string;
}

/**
 * Top-level shape of data/people.json.
 */
interface PeopleFile {
  current: Person[];
  alumni: Person[];
}
