import React from "react";

const Hero = () => {
  return (
    <div className="mx-auto max-w-2xl py-16 sm:py-16 lg:py-16">
      <div className="hidden sm:mb-8 sm:flex sm:justify-center">
        <div className="relative rounded-full px-3 py-1 text-sm text-semibold leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
          Announcing version v1.18
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Health Diet Screening Assessment
        </h1>
        <p className="mt-6 text-md leading-8 text-gray-600">
          Start your health journey by understanding your nutritional needs. Get
          a tailored report and advice to boost your wellness.
        </p>
      </div>
    </div>
  );
};

export default Hero;
