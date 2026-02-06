// hooks/wrdHooks/useProgress.ts
export const useProgress = (workId: string) => {
  // API call to fetch progress history
  return { data: [], isLoading: false, error: null };
};

// API endpoints:
// POST /api/progress/submit - Operator submits progress
// POST /api/progress/review - Reviewer reviews progress
// POST /api/progress/approve - Approver approves progress
// GET /api/works/assigned - Get assigned works