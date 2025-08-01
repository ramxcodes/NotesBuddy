export interface UmamiStatistics {
  views: number;
  visitors: number;
  pages: number;
  visitDuration: number; // in seconds
}

export interface UmamiApiResponse {
  pageviews: {
    value: number;
  };
  visitors: {
    value: number;
  };
  visits: {
    value: number;
  };
  bounces: {
    value: number;
  };
  totaltime: {
    value: number;
  };
}

export interface UmamiPagesResponse {
  data: Array<{
    x: string;
    y: number;
  }>;
}

export interface UmamiTimeSeriesResponse {
  pageviews: Array<{
    x: string;
    y: number;
  }>;
  sessions: Array<{
    x: string;
    y: number;
  }>;
}

export interface UmamiMetricsResponse {
  data: Array<{
    x: string;
    y: number;
  }>;
}

export interface UmamiEventResponse {
  data: Array<{
    x: string;
    y: number;
  }>;
}

export interface DetailedUmamiStatistics {
  // Overview stats
  totalPageviews: number;
  uniqueVisitors: number;
  totalSessions: number;
  bounceRate: number;
  averageVisitTime: number;

  // Time series data
  pageviewsTimeSeries: Array<{ date: string; views: number }>;
  visitorsTimeSeries: Array<{ date: string; visitors: number }>;

  // Top content
  topPages: Array<{ page: string; views: number; percentage: number }>;
  topReferrers: Array<{
    referrer: string;
    visitors: number;
    percentage: number;
  }>;

  // Device & browser data
  browsers: Array<{ browser: string; visitors: number; percentage: number }>;
  operatingSystems: Array<{ os: string; visitors: number; percentage: number }>;
  devices: Array<{ device: string; visitors: number; percentage: number }>;

  // Geographic data
  countries: Array<{ country: string; visitors: number; percentage: number }>;

  // User behavior
  events: Array<{ event: string; count: number }>;
  sessionDuration: Array<{ duration: string; sessions: number }>;
}

export type TimeRange = "24h" | "7d" | "15d" | "30d" | "custom";

export interface CustomDateRange {
  startDate: Date;
  endDate: Date;
}
