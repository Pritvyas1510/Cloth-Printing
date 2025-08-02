import React from 'react';

const OurTeam = () => {
  return (
    <section className="bg-white py-16 text-center">
      <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
    Meet the Team
  </h2>
  <p className="text-[#0d141c] text-base font-normal leading-normal pb-3 pt-1 px-4">
    Our team is composed of passionate individuals with diverse backgrounds and
    expertise. We share a common goal: to provide the best possible experience
    for our customers. Here are some of the key members of our team:
  </p>
  <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
    <div className="flex flex-col gap-3 text-center pb-3">
      <div className="px-4">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-full"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmqpW-seopMrmXkNX_mgdJI5QZwdpju9s8ovyVucsPAxy2iJQ9d2X6bMO0Dh1SBARE_lNrJQXi1gTa6v08hibPNl6EhUkzmDQszyxjhO8TjU9DCid-xAyCdbuWnlFR8NgmLgeYfbXHAw3MTXtWwCkgQnScXXPxrq_Jj2mWuGhsFYEr81cqW6dWlFM5DcLCpC1CGkKB7eafRtUsGIAuUAyow60UQ9lBmAfq-KEFdITpF26xcL6I9dYIsTFvrkUduk-JENPay6NzEndj")'
          }}
        />
      </div>
      <div>
        <p className="text-[#0d141c] text-base font-medium leading-normal">
          Sarah Chen
        </p>
        <p className="text-[#49739c] text-sm font-normal leading-normal">CEO</p>
      </div>
    </div>
    <div className="flex flex-col gap-3 text-center pb-3">
      <div className="px-4">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-full"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBGW6V1sC_YRX0kM25MFYxgudOF8gnXg53r8AuuEpmsf6513TsTlTV19Ce0_pb05HqBgmEkI7YK_1QUWPqMKJAh1cSZ7i14W6cFF-Boc9G6VJoCN7un9zWvlNQt4z8pv09gjNntgGXqy1RbXnVoxzeI28M22w3uLC3wqL6r41-muMn6JLrAJ36xRVJhT3Wg2P8cplyOadYV2WGU-aEab98UdpWLKzd4zw1uWcKQZTcS6hRFXoX7Tg6Zq2JGDkYI4wzQb9a_B_NdKVW6")'
          }}
        />
      </div>
      <div>
        <p className="text-[#0d141c] text-base font-medium leading-normal">
          David Lee
        </p>
        <p className="text-[#49739c] text-sm font-normal leading-normal">
          Head of Design
        </p>
      </div>
    </div>
    <div className="flex flex-col gap-3 text-center pb-3">
      <div className="px-4">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-full"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9_2IS5exdkLXFA4twN45Y6Pdx0Aw2c0ZPh9Qi7lHSz15TnURYj970jlYBeB6KbkJ3vDlHIgZtNSeToKPIhLHaC4JUODMlugyAGT_nX_ZI3xE4mk36pX6BdJ3-wGFF-EgJU_315LOgT9yQT7fTsC9NPNedUJE9jWQacd2YgHthdpFm3EVWZB0zFuO_mtluqGuDHdfinps2PPPWP4LCrMZCaYN3H3FKeX6ZhUde13JaKbHmQJbRTpRP8mCkOhLGZEsZUizQqhUVyuy1")'
          }}
        />
      </div>
      <div>
        <p className="text-[#0d141c] text-base font-medium leading-normal">
          Emily Wong
        </p>
        <p className="text-[#49739c] text-sm font-normal leading-normal">
          Marketing Manager
        </p>
      </div>
    </div>
    <div className="flex flex-col gap-3 text-center pb-3">
      <div className="px-4">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-full"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDvDi4muZUwX2pmVSSNGklNBXAFHm5TQ077zBaQrTBFPr2WEheSZM47OIfd8kZn4AHfuR--q-oqjcPQ1X3a4WhGNO_ef_qRDoq1f9BIw9aZF6otQ9drtTJESKaggcQW6RWxzP9lVvIbOa7ZMmNwVkFypMeUW1C3YYh4HbpNKdxiair2fxt2SeiD7LDkMCSE-0B9HZFRcib24XnoQa5syMS4OEuPc4wn9Vd8rOsNPhNM4p1hQqzo2yBif7exr42dhqG0gYZm2jj-z90R")'
          }}
        />
      </div>
      <div>
        <p className="text-[#0d141c] text-base font-medium leading-normal">
          Michael Tan
        </p>
        <p className="text-[#49739c] text-sm font-normal leading-normal">
          Operations Lead
        </p>
      </div>
    </div>
  </div>
  <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
    Our Workspace
  </h2>
  <div className="flex w-full grow bg-slate-50 @container p-4">
    <div className="w-full gap-1 overflow-hidden bg-slate-50 @[480px]:gap-2 aspect-[3/2] rounded-lg grid grid-cols-[2fr_1fr_1fr]">
      <div
        className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none row-span-2"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDvKFeT6m-_0DAicLqFxIqQu4ZyoVjvEhC0JlmxoevwNrbESZiB3LusTR5Jz6qhf4XjP_j9JWbrKsjiY_m48B6V0iRmTJQ72jLqo4woN15c5o6vdC0_7JsZc17pBMCD9IK7iptffeMbdT_14Dpe2bsgJiSEggZiOvmePCdMr1SJCuBLZY8KF9L-JXnkHr3MAEWEMkZTEjacl9NhSLMCP0fgQ7BqK46L2OWx7vozGH-KT6VasUBA87JK3GMmZjWT5uiM-U7tEIeyjyg9")'
        }}
      />
      <div
        className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-none col-span-2 row-span-2"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA0cRaN0zFOR3TIO9cbZsAEnnxRkZW4bE45FC7j-uGZSVGftuHzlv2GpM2qaYHl1FBh_0j41n0RGSGhCin3-4STT7vOwxtqryQp8x9VKRFSb2QilK-SoyRJvv-z-eaPoo85En7O3bAKHqZZMM-HYn0ETNYr2BPXs8XO6bfHawuq51Cmgwk0NLjrmE_DDovDuGmMrBFPhsu4SKkI46gH4I30BBpb5GYaw4hUjAZMDuF5nVXGIBk_ciOQ8ZDHSztBsAgkG9tFGRMyjbdw")'
        }}
      />
    </div>
  </div>
  <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
    Satisfied Customers
  </h2>
  <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div className="flex items-stretch p-4 gap-3">
      <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA1YJ1yRt76CDJ_YJAt9T9r57RnqMv-r7BzexUoAKOpAUGCtU4QQQ59kg-iA_LgLl3do8qUiiE-SB1kEJE4xs30hLu5QTF3uaYR0XhCz11Tfcyfl2d5J_7gr36UECHv4dnUpkegKEc7sW4uP3OvueYTbVsmC89cLKrADLW3XKRmeHRNpORKP0bmzclNtJ0msU9Q9p5CsRfspFSnNY9qeTFUGgIse3q-Jn0EhBf7JINT5TqSuk45OtjtzgHU-KWONmNgEaJt4oZvg8Cg")'
          }}
        />
        <div>
          <p className="text-[#0d141c] text-base font-medium leading-normal">
            "I love the quality of the print and the fabric. My design looks
            amazing!"
          </p>
          <p className="text-[#49739c] text-sm font-normal leading-normal">
            - Alex
          </p>
        </div>
      </div>
      <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDMo8SVBVq1tmcp2QpsXgt_9rhjCsnwQ-65T-FtbB2tXznCAh2E-cgzm6XOeqWMTUxqrsMdTu3J7oV5sIxxWSqiEjm99nECKS-x4gggl6lNP1TYeVeFQvhCFJzm4GaSLKCKNq9yJTpRJp0bo4LBEjzTbio2bBwCGRw0Eybvtu_GpRE9zRMmnIpot_eDfqC-vcCg66cqbqfAzS31fr9JABMMRlGcgppMw_1IXh2l8MqEsdA_o2eJdp4ggXME6TSVDRUQqNORx7Sd1NNK")'
          }}
        />
        <div>
          <p className="text-[#0d141c] text-base font-medium leading-normal">
            "The ordering process was so easy, and the delivery was fast. Highly
            recommend!"
          </p>
          <p className="text-[#49739c] text-sm font-normal leading-normal">
            - Maria
          </p>
        </div>
      </div>
      <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
        <div
          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxwhiwGR7FRtqHXIHR5i1NX52TMvAGZUzmUuyathIXCwuShWvD-Qvxiho5U7seY-Dl0zocMTIcmcvE5AmdnJmUSgWgvgxzdLSmkwdw7MVK1Q7zjM4xs0MQk3JlI8qAL1YB-PoFdANh0gTbENChpQv75h1RnjVUtsYG8gq2OY6MqEgOnzAXca7thNoGG53afwliGcZEwJrYKSZ9VnyQMX0Wr2__YAPHUR5cJlJ0O551FUocW8hMELaNXkjm63DYyXzuSyMEWJ5nIohs")'
          }}
        />
        <div>
          <p className="text-[#0d141c] text-base font-medium leading-normal">
            "Great service and excellent customer support. I'll definitely be
            ordering again."
          </p>
          <p className="text-[#49739c] text-sm font-normal leading-normal">
            - Ben
          </p>
        </div>
      </div>
    </div>
  </div>
    </section>
  );
};

export default OurTeam;
