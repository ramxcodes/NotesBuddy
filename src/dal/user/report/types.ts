export type CreateReportInput = {
  userId: string;
  report: string;
  url: string;
};

export type Report = {
  id: string;
  userId: string;
  report: string;
  url: string;
  createdAt: Date;
};
