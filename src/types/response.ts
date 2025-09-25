export interface ResultFixedIssues {
  fixedDetail: LineChange[];
}

export interface LineChange {
  fileChange: string;
  originText: {
    lineStart: number;
    lineEnd: number;
    content: string;
  }; // text before change
  changeText: {
    lineStart: number;
    lineEnd: number;
    content: string;
  }; // text after change
}
