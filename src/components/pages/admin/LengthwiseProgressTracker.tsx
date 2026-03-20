import { useState } from 'react';

// Define types for better type safety
type Department = 'rdd' | 'wrd' | 'doa';
type Timeframe = 'monthly' | 'quarterly';
type Metric = 'progress' | 'pdo';

interface TimelineItem {
  period: string;
  rdd: number;
  wrd: number;
  doa: number;
  pdo: {
    rdd: number;
    wrd: number;
    doa: number;
  };
}

interface TimelineData {
  monthly: TimelineItem[];
  quarterly: TimelineItem[];
}

const LengthwiseProgressTracker = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [selectedMetric, setSelectedMetric] = useState<Metric>('progress');

  const timelineData: TimelineData = {
    monthly: [
      { period: 'Jan', rdd: 65, wrd: 45, doa: 80, pdo: { rdd: 70, wrd: 50, doa: 82 } },
      { period: 'Feb', rdd: 70, wrd: 52, doa: 85, pdo: { rdd: 75, wrd: 55, doa: 86 } },
      { period: 'Mar', rdd: 78, wrd: 58, doa: 88, pdo: { rdd: 80, wrd: 60, doa: 90 } },
      { period: 'Apr', rdd: 82, wrd: 62, doa: 92, pdo: { rdd: 85, wrd: 65, doa: 94 } },
    ],
    quarterly: [
      { period: 'Q1', rdd: 68, wrd: 48, doa: 82, pdo: { rdd: 72, wrd: 52, doa: 84 } },
      { period: 'Q2', rdd: 75, wrd: 55, doa: 86, pdo: { rdd: 78, wrd: 58, doa: 88 } },
      { period: 'Q3', rdd: 82, wrd: 62, doa: 92, pdo: { rdd: 85, wrd: 65, doa: 94 } },
    ]
  };

  const getMetricValue = (item: TimelineItem, dept: Department): number => {
    if (selectedMetric === 'progress') {
      return item[dept];
    } else {
      return item.pdo[dept];
    }
  };

  // Safely get current timeframe data
  const currentData = timelineData[timeframe] || timelineData.monthly;

  // Calculate max height for bars (64px = 100%)
  const getBarHeight = (value: number): string => {
    return `${value * 0.64}px`;
  };

  // Get department color
  const getDepartmentColor = (dept: Department): string => {
    const colors = {
      rdd: 'bg-purple-600',
      wrd: 'bg-blue-600',
      doa: 'bg-green-600'
    };
    return colors[dept];
  };

  // Calculate overall growth
  const calculateOverallGrowth = (): string => {
    const firstMonth = currentData[0];
    const lastMonth = currentData[currentData.length - 1];
    
    if (selectedMetric === 'progress') {
      const avgFirst = (firstMonth.rdd + firstMonth.wrd + firstMonth.doa) / 3;
      const avgLast = (lastMonth.rdd + lastMonth.wrd + lastMonth.doa) / 3;
      return `+${Math.round(((avgLast - avgFirst) / avgFirst) * 100)}%`;
    } else {
      const avgFirst = (firstMonth.pdo.rdd + firstMonth.pdo.wrd + firstMonth.pdo.doa) / 3;
      const avgLast = (lastMonth.pdo.rdd + lastMonth.pdo.wrd + lastMonth.pdo.doa) / 3;
      return `+${Math.round(((avgLast - avgFirst) / avgFirst) * 100)}%`;
    }
  };

  // Get best performing department
  const getBestPerforming = (): { dept: Department; value: number } => {
    const lastMonth = currentData[currentData.length - 1];
    const departments: Department[] = ['rdd', 'wrd', 'doa'];
    
    let bestDept: Department = 'doa';
    let bestValue = 0;
    
    departments.forEach(dept => {
      const value = getMetricValue(lastMonth, dept);
      if (value > bestValue) {
        bestValue = value;
        bestDept = dept;
      }
    });
    
    return { dept: bestDept, value: bestValue };
  };

  const bestPerforming = getBestPerforming();
  const bestDeptName = bestPerforming.dept.toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Length-wise Progress Trend</h3>
          <p className="text-sm text-gray-600 mt-1">Track progress and PDO trends over time</p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <select 
            className="px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          
          <select 
            className="px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as Metric)}
          >
            <option value="progress">Progress</option>
            <option value="pdo">PDO Score</option>
          </select>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-80 mt-8">
        {/* Y-axis labels */}
        <div className="absolute -left-2 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Chart grid lines */}
        <div className="absolute left-8 right-0 top-0 h-full">
          {[0, 25, 50, 75, 100].map((value) => (
            <div 
              key={value}
              className="absolute w-full border-t border-gray-200"
              style={{ bottom: `${value}%` }}
            ></div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="absolute left-8 right-0 bottom-0 flex items-end justify-around h-64">
          {currentData.map((item, idx) => (
            <div key={idx} className="w-1/4 px-2">
              <div className="flex justify-center gap-1">
                {/* RDD Bar */}
                <div className="flex-1 max-w-[30px]">
                  <div 
                    className={`${getDepartmentColor('rdd')} rounded-t transition-all duration-500 hover:opacity-80`}
                    style={{ height: getBarHeight(getMetricValue(item, 'rdd')) }}
                  >
                    <div className="text-xs text-white text-center font-bold pt-1">
                      {getMetricValue(item, 'rdd')}%
                    </div>
                  </div>
                </div>
                
                {/* WRD Bar */}
                <div className="flex-1 max-w-[30px]">
                  <div 
                    className={`${getDepartmentColor('wrd')} rounded-t transition-all duration-500 hover:opacity-80`}
                    style={{ height: getBarHeight(getMetricValue(item, 'wrd')) }}
                  >
                    <div className="text-xs text-white text-center font-bold pt-1">
                      {getMetricValue(item, 'wrd')}%
                    </div>
                  </div>
                </div>
                
                {/* DoA Bar */}
                <div className="flex-1 max-w-[30px]">
                  <div 
                    className={`${getDepartmentColor('doa')} rounded-t transition-all duration-500 hover:opacity-80`}
                    style={{ height: getBarHeight(getMetricValue(item, 'doa')) }}
                  >
                    <div className="text-xs text-white text-center font-bold pt-1">
                      {getMetricValue(item, 'doa')}%
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-center mt-2 font-medium text-gray-700">{item.period}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legend and Stats */}
      <div className="mt-8 flex flex-wrap items-center justify-between border-t pt-6">
        <div className="flex gap-6">
          <span className="flex items-center text-sm">
            <span className="w-3 h-3 bg-purple-600 rounded-full mr-1"></span> RDD
          </span>
          <span className="flex items-center text-sm">
            <span className="w-3 h-3 bg-blue-600 rounded-full mr-1"></span> WRD
          </span>
          <span className="flex items-center text-sm">
            <span className="w-3 h-3 bg-green-600 rounded-full mr-1"></span> DoA
          </span>
        </div>
        
        <div className="flex gap-6 mt-4 md:mt-0">
          <div className="text-right">
            <p className="text-sm text-gray-600">Overall Growth</p>
            <p className="text-lg font-bold text-green-600">{calculateOverallGrowth()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Best Performing</p>
            <p className="text-lg font-bold text-purple-600">
              {bestDeptName} ({bestPerforming.value}%)
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <span>Showing {selectedMetric === 'progress' ? 'Progress' : 'PDO Scores'} - {timeframe === 'monthly' ? 'Monthly' : 'Quarterly'} View</span>
      </div>
    </div>
  );
};

export default LengthwiseProgressTracker;