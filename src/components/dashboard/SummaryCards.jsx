
export default function SummaryCards({ totalPlan, totalAchieved, avgProgress }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-lg p-6 shadow-lg">
        <p className="text-gray-400 text-sm">GLOBAL PLAN QTY</p>
        <p className="text-3xl font-bold text-white mt-2">{totalPlan.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-lg p-6 shadow-lg">
        <p className="text-gray-400 text-sm">TOTAL ACHIEVED</p>
        <p className="text-3xl font-bold text-green-400 mt-2">{totalAchieved.toLocaleString()}</p>
      </div>
      
      <div className="bg-card rounded-lg p-6 shadow-lg">
        <p className="text-gray-400 text-sm">AVERAGE PROGRESS</p>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-3xl font-bold text-blue-400">{avgProgress}%</p>
          <div className="flex-1 bg-gray-700 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(avgProgress, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}