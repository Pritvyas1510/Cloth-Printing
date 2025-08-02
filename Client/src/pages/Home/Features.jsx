import React from 'react';

const Features = () => {
  return (
    <section className="py-16 bg-white">
       <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
    Featured Designs
  </h2>
  <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
    <div className="flex flex-col gap-3">
      <div
        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAjZ9g377SKzD4jpgohRR9BxU_O3aJI8T-Z_EkWNY0w12GsC-2lj5U0o8_UIm4noKDl_iF9YXWFDLpjKwt2NuWeZ-h07ICBTazYM7bjN8OXAwuejRk08Sh7rQHhWh-GBQfAQRpdX7phNIfrUPyvfOR3pZSrMYJGjS5mYr7oXOk78H8VGOWyKqOG3nBwWo31BHHdtAnJ2YRmCcPWQ5n206CKgROSyp0ElrCAN1srhb5MBPc-p4Xq98lzmAs69Ajnwq3fNmHI7kDtcMFR")'
        }}
      />
    </div>
    <div className="flex flex-col gap-3">
      <div
        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBs7hlZScTyiT63ico6lT6SUAYJpexZrgQU0z7jqnfj_3pQPNOii0doU8CulfVVYdsffe28oZWVMUd2Ux65iY2ciknm6UnOpoe_HWbQir8g68NkCyN5odw8wH0FcPZ9QOYPZriUV75JmWbu6PQL_R-4YMZmbsHbIyBtQs4e-zICfPxpW00HFqd08mWLU1Pn5hpq7qJGHjbg6j4NOvPDI5pdzW80lae_-mnNm6_x9YMIQlZlZn1HbIapbktUHpJ9gA9Hil7VgGvphrL-")'
        }}
      />
    </div>
    <div className="flex flex-col gap-3">
      <div
        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCCl7L8WQOWnb-n29n7Ri30RejarcujKapJhZqlOUr_pgcSGWRztrdEr9w9fL-nnj4t5OJTQk45T-cqZZi7EM8h1l950ej4Cz3ze18mtz18Osz9Y0p9WLqqXgmpw1Gph4eB2fQpBqd82folSZTCgzl5rqyHEtDlnbAJ2O8y5hBw7YqfzqGifSaLOiyWVP1pSSvSYA9eqmfPbSfhJATxyVsDXD7U0IWP9yCoGdm5cQMi8jPcv6kL0esym_4awR7p5Mwo00_pcvyvtu50")'
        }}
      />
    </div>
  </div>
    </section>
  );
};

export default Features;