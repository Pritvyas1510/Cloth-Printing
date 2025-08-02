import React from 'react';

const Hero = () => {
  return (
    <section>
      <div className="@container">
        <div className="@[480px]:p-4">
          <div
            className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCP1BHnNm2UAkDwEZJJEk9JjB-64x8C2FHrlG3jGUYoWh6pdvEknGUFYjgtCYDx7aQz7xpfM3gmIaWAYgGlLq3Fr1TwjxsvdGNoYY2WeMmtOk2MwXfDW0vZdyCX6CNBqmoe-ppma0-yXTowLIzFiASTbJDfdanaoE9sUF9kmAB979npa3OnCAiSoGuT_srJ5l55dwjjwr_0PmLeev4al_sKSLwvB5DaNtemG8WEXZYL5d8jDOCVsGfah7dIZvtsTYKcrIaDw-Eikqe9")'
            }}
          >
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                Design Your Style, Wear Your Story
              </h1>
              <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                Create unique, custom t-shirts with your designs. Choose from a
                variety of vendors for printing and delivery.
              </h2>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#3d98f4] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em]">
              <a href='Design'><span className="truncate">Start Designing</span></a>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;