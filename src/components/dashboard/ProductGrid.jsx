export default function ProductGrid({ products }) {
  const productColors = {
    'HT CT': 'border-blue-500',
    'PT': 'border-green-500',
    'Bushing CT': 'border-yellow-500',
    'INSULATOR': 'border-red-500',
    'KE VCB Bushing': 'border-purple-500',
    'LTCT ITR-WLT': 'border-pink-500',
    'EARTHING SWITCH': 'border-orange-500'
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const progress = product.targetQuantity > 0 
          ? ((product.achievedQuantity / product.targetQuantity) * 100).toFixed(1) 
          : 0;
        
        const colorClass = productColors[product.productName] || 'border-gray-500';
        
        return (
          <div 
            key={product.id} 
            className={`bg-card rounded-lg p-4 shadow-lg border-l-4 ${colorClass}`}
          >
            <h3 className="text-lg font-semibold text-white">{product.productName}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-400">PLAN: {product.targetQuantity}</p>
              <p className="text-sm text-gray-400">ACHIEVED: {product.achievedQuantity || 0}</p>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-right font-semibold text-white">
                {progress}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}