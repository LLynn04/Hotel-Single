// import React from 'react'
import Banner from "../components/Banner";
import DateRangePicker from "../components/DateRangePicker";
import Categories from "../components/Categories";
import AllRoom from "../components/AllRoom";
import Service from "../components/Service";

const Homepage = () => {
  return (
    <>
      <div>
        {/* banner */}
        <section>
          <Banner />
        </section>

        {/* date range picker */}
        <section>
          <DateRangePicker />
        </section>

        {/* categoris */}
        <section>
          <Categories />
        </section>

        {/* all rooms */}
        <section>
          <AllRoom />
        </section>

        {/* services */}
        <section>
          <Service /> 
        </section>
      </div>
    </>
  );
};

export default Homepage;
