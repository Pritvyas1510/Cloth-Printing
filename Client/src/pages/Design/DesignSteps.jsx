import React from 'react';

const DesignSteps = ({ selectedProduct }) => {
    const BASE_URL = import.meta.env.BACKEND_URI; 
  const colorStyles = {
    Red: 'bg-red-500', Blue: 'bg-blue-500', Green: 'bg-green-500', Black: 'bg-black',
    White: 'bg-white border border-[#cedbe8]', Yellow: 'bg-yellow-500', Orange: 'bg-orange-500',
    Purple: 'bg-purple-500', Pink: 'bg-pink-500', Brown: 'bg-amber-700', Gray: 'bg-gray-500',
    Cyan: 'bg-cyan-500', Magenta: 'bg-fuchsia-500', Navy: 'bg-indigo-900', Teal: 'bg-teal-500',
    Maroon: 'bg-red-900', Olive: 'bg-olive-600', Lime: 'bg-lime-500', Silver: 'bg-gray-300',
    Gold: 'bg-yellow-600'
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-bold text-[#0d141c] mb-6">Customize {selectedProduct.title}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">T-Shirt Style</p>
                <select className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal">
                  <option value="classic">Classic</option>
                  <option value="v-neck">V-Neck</option>
                  <option value="polo">Polo</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Size</p>
                <select className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal">
                  {selectedProduct.size.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Color</p>
                <div className="flex gap-3 flex-wrap">
                  {selectedProduct.color.map((color) => (
                    <span
                      key={color}
                      className={`w-8 h-8 rounded-full ${colorStyles[color]} border-2 ${color === 'White' ? 'border-[#cedbe8]' : 'border-[#0d141c]'} shadow-sm hover:scale-110 transition duration-200`}
                      title={color}
                    />
                  ))}
                </div>
              </label>
            </div>
            <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-[#cedbe8] px-6 py-14">
              <div className="flex max-w-[480px] flex-col items-center gap-2">
                <p className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] text-center">
                  Drag and drop your design here
                </p>
                <p className="text-[#49739c] text-sm font-normal leading-normal text-center">
                  Or browse files to upload
                </p>
              </div>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Upload Design</span>
              </button>
            </div>
          </div>
          <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
            <div
              className="w-full h-full bg-no-repeat bg-center"
              style={{
                backgroundImage: selectedProduct.images[0]
                  ? `url(${BASE_URL}/${selectedProduct.images[0]})`
                  : 'url("https://via.placeholder.com/300")',
                backgroundSize: '60%',
              }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignSteps;