export interface AnalyzeResult {
  box: { x: number; y: number; width: number; height: number } | null;
  label: string;
  value: string;
  instruction: string;
}
