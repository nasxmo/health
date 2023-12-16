import React from "react";
import DietAssessment from "./components/DietAssessment";
import Hero from "./components/Hero";

const App = () => {
  return (
    <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-100 to-teal-100">
      <Hero />
      <DietAssessment />
    </div>
  );
};

export default App;
