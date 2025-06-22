// import React from 'react'
import Banner from "../components/Banner";
import DateRangePicker from "../components/DateRangePicker";
import Categories from "../components/Categories";

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
      </div>
    </>
  );
};

export default Homepage;
