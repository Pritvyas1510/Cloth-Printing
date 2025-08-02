import React from 'react';

const Testimonials = () => {
  return (
    <section className="py-16 bg-gray-50">
       <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
    Customer Testimonials
  </h2>
  <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div className="flex items-stretch p-4 gap-3">
      <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCm2YTZKsjtJG4knq2qrdCOMV2WOnfKhGTmaPBIQCnz_b8ii9mz-8jQ4TRTV_nqXjSuy82-K_oFhhSDYxXoXlSzVX_9VKinDvRd3AgQN1b0wqmSjP5hWo0pVt2Hz3EBy_QqDT2kozL-TCvca2Cqoin1a95lC5xogDmSg23MBHG5J06suF8ojsniOxYGLVCCzxCsolvh6UVY2Tlblo4D5IMJurEpjb2isyHxYUw8y4GfKnHz7XQcWyrhjMude94JmCos9hPNLo9FZ-NT")'
          }}
        />
        <div>
          <p className="text-[#0d141c] text-base font-medium leading-normal">
            Sarah M.
          </p>
          <p className="text-[#49739c] text-sm font-normal leading-normal">
            "I love the quality of the print and the ease of designing my own
            t-shirt. Highly recommend!"
          </p>
        </div>
      </div>
      <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCfBeev35784zAskny45tqTVj44v7W2F7zxZMsi0cfBo5wU0IDq4jK3Q8kEpJGsdi4qGASVxpfW9cvfcfPlZf1WLvGAYrc3B-hP0ekUhsucC4TsM62y_JZOOJ8HcamqMXuQoaSoN_l4hk35s0XaOZObn3oT0Vyh66DpjoOpYQIu2xRTtyXmkTNYf25WO3EhPj3LpDlSavk0mQeGCZaG98dgSsj_CP1EL_hQGYIu0_d1ayp5a4XNpcU0ymPva05YVK8fGjJxkwrnGD2c")'
          }}
        />
        <div>
          <p className="text-[#0d141c] text-base font-medium leading-normal">
            David L.
          </p>
          <p className="text-[#49739c] text-sm font-normal leading-normal">
            "Great service and fast delivery. My custom t-shirt turned out
            exactly as I wanted."
          </p>
        </div>
      </div>
      <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAg-6bK9PBhPWuNR3MEqmkV8vsQau0UVOwg8cyhh_k1HQF_CRk76EIsFC2n4H6kApD9v1vQ1i5AhGS1gFeAavpEpd3Un0HevrkIoEAPYmYeqLjjGBhtxwEXaGoeg9FMw1JZduQ1gGn5l5560Lh_4rv3SlQRIxdT7OfssqmSaKovOEwnwGK6xg5JDckQRXEfQ51iDweVc5t-ttes3xIaSK6nNQmERPpT9pIkBV2wLO0lyacH2w6A9gP1Y1AzbmyNk4_U6y6JNgyJRWkw")'
          }}
        />
        <div>
          <p className="text-[#0d141c] text-base font-medium leading-normal">
            Emily R.
          </p>
          <p className="text-[#49739c] text-sm font-normal leading-normal">
            "The vendor selection process was straightforward, and I'm very
            happy with the final product."
          </p>
        </div>
      </div>
    </div>
  </div>
    </section>
  );
};

export default Testimonials;
