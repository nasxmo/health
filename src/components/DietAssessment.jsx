// Calculator.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";

const DietAssessment = () => {
  const ref = useRef();
  const [hasCalculated, setHasCalculated] = useState(false);
  const [calculatedPDF, setCalculatedPDF] = useState(false);

  // Options for the PDF generation
  const options = {
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  };

  const handlePrintToPDF = async () => {
    try {
      if (!hasCalculated) {
        console.warn("Please calculate before downloading PDF");
        return;
      }

      const container = ref.current;

      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";

      const captureOptions = {
        scale: 2.0,
        logging: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
      };

      const canvas = await html2canvas(container, captureOptions);

      container.style.display = "block";
      container.style.flexDirection = "unset";
      container.style.alignItems = "unset";

      const pdf = new jsPDF({
        orientation: options.orientation,
        unit: options.unit,
        format: options.format,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = canvas.width * 0.1;
      const imageHeight = canvas.height * 0.13;
      const xPosition = (pdfWidth - imageWidth) / 2;
      const yPosition = (pdfHeight - imageHeight) / 8;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        xPosition,
        yPosition,
        imageWidth,
        imageHeight
      );

      const pdfCreationDate = new Date();
      pdf.setFontSize(10);
      pdf.text(
        `Generated on: ${pdfCreationDate.toLocaleString()}`,
        20,
        pdf.internal.pageSize.getHeight() - 10
      );

      pdf.save("diet_screening_results.pdf");
      setCalculatedPDF(true);
    } catch (error) {
      console.error("Error printing to PDF:", error);
    }
  };

  //states
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [tdeeActivityLevel, setTdeeActivityLevel] = useState("none");
  const [beeActivityFactor, setBeeActivityFactor] = useState("none");
  const [beeStressLevel, setBeeStressLevel] = useState("none");
  const [tdee, setTdee] = useState(null);
  const [, setBee] = useState(null);
  const [tee, setTee] = useState(null);
  const [bmi, setBMI] = useState(null);
  const [idealWeight, setIdealWeight] = useState(null);
  const [ageError, setAgeError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [numberOfMeals, setNumberOfMeals] = useState(3);
  const [bmiCategory, setBMICategory] = useState(null);
  const [enteralProduct, setEnteralProduct] = useState(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);

  const calculate = () => {
    // Reset previous errors
    setAgeError("");
    setWeightError("");
    setHeightError("");

    // Check if required fields are empty
    if (!age) {
      setAgeError("Please enter your age");
    }

    if (!weight) {
      setWeightError("Please enter your weight");
    }

    if (!height) {
      setHeightError("Please enter your height");
    }

    if (!age || !weight || !height) {
      console.warn("Please fill in all the required fields");
      return;
    }

    setHasCalculated(true);
    const heightInMeters = height / 100;

    const bee =
      gender === "male"
        ? 88.362 + 13.397 * weight + 4.799 * heightInMeters * 100 - 5.677 * age
        : 447.593 + 9.247 * weight + 3.098 * heightInMeters * 100 - 4.33 * age;

    //tdee
    const tdeeActivityLevelMultipliers = {
      sedentary: 1.2,
      lightlyActive: 1.375,
      moderatelyActive: 1.55,
      veryActive: 1.725,
      extraActive: 1.9,
    };

    //bee inpatient
    const beeActivityFactorMultipliers = {
      sedated: 0.9,
      conscious: 1.0,
      bedrest: 1.2,
      bedrestLong: 1.3,
      mobilising: 1.4,
      mobFreq: 1.4,
      physio: 1.5,
      conmov: 1.6,
    };

    // stress factors
    const beeStressLevelMultipliers = {
      medical: 1.1,
      surgical: 1.4,
      cancer: 1.3,
      trauma: 1.2,
      sepsis: 1.3,
      majorBurns: 1.4,
      ventilation: 1.3,
      afterVentilation: 1.6,
    };

    const tdeeActivityLevelMultiplier =
      tdeeActivityLevelMultipliers[tdeeActivityLevel] || 1.0;
    const beeActivityFactorMultiplier =
      beeActivityFactorMultipliers[beeActivityFactor] || 1.0;
    const beeStressLevelMultiplier =
      beeStressLevelMultipliers[beeStressLevel] || 1.0;

    //tdee formula
    const tdee = bee * tdeeActivityLevelMultiplier;

    //tee formula
    const tee =
      parseFloat(bee) * beeActivityFactorMultiplier * beeStressLevelMultiplier;

    //bmi formula
    const bmi = weight / (heightInMeters * heightInMeters);

    //Determine BMI category
    let category = "";
    if (bmi < 18.5) {
      category = "Underweight";
    } else if (bmi < 22.9) {
      category = "Normal Weight";
    } else if (bmi < 27.5) {
      category = "Overweight";
    } else if (bmi < 32.5) {
      category = "Pre-obesity";
    } else if (bmi < 37.5) {
      category = "Obesity Class I";
    } else if (bmi < 40.0) {
      category = "Obesity Class II";
    } else {
      category = "Obesity Class III";
    }

    // Set BMI category to state
    setBMICategory(category);

    const idealWeight = 22.5 * (heightInMeters * heightInMeters);

    setTdee(tdee ? tdee.toFixed(2) : null);
    setBee(bee ? bee.toFixed(2) : null);
    setBMI(bmi ? bmi.toFixed(2) : null);
    setIdealWeight(idealWeight ? idealWeight.toFixed(2) : null);
    setTee(tee ? tee.toFixed(2) : null);
    setShowDownloadButton(true);
  };

  const calculateCaloriesPerMeal = useCallback(
    (totalDailyCalories) => {
      switch (numberOfMeals) {
        case 3:
          return {
            breakfast: (totalDailyCalories * 0.3).toFixed(2),
            lunch: (totalDailyCalories * 0.35).toFixed(2),
            dinner: (totalDailyCalories * 0.35).toFixed(2),
          };
        case 4:
          return {
            breakfast: (totalDailyCalories * 0.25).toFixed(2),
            morningSnack: (totalDailyCalories * 0.1).toFixed(2),
            lunch: (totalDailyCalories * 0.35).toFixed(2),
            dinner: (totalDailyCalories * 0.3).toFixed(2),
          };
        case 5:
          return {
            breakfast: (totalDailyCalories * 0.2).toFixed(2),
            morningSnack: (totalDailyCalories * 0.1).toFixed(2),
            lunch: (totalDailyCalories * 0.3).toFixed(2),
            afternoonSnack: (totalDailyCalories * 0.1).toFixed(2),
            dinner: (totalDailyCalories * 0.3).toFixed(2),
          };
        case 6:
          return {
            breakfast: (totalDailyCalories * 0.2).toFixed(2),
            morningSnack: (totalDailyCalories * 0.1).toFixed(2),
            lunch: (totalDailyCalories * 0.25).toFixed(2),
            afternoonSnack: (totalDailyCalories * 0.1).toFixed(2),
            dinner: (totalDailyCalories * 0.25).toFixed(2),
            supper: (totalDailyCalories * 0.1).toFixed(2),
          };
        default:
          return {};
      }
    },
    [numberOfMeals]
  );

  const caloriesPerMealTDEE = useMemo(() => {
    if (tdee !== null) {
      const totalDailyCalories = tdee;
      return calculateCaloriesPerMeal(totalDailyCalories);
    }
    return {};
  }, [tdee, calculateCaloriesPerMeal]);

  // Helper function to get multiplier for enteral product
  const getMultiplierForEnteralProduct = useCallback((product) => {
    // Move these objects inside the useCallback callback
    const ensureMultipliers = {
      ensure_2: 87.4,
      ensure_4: 174.8,
      ensure_6: 262.2,
      ensure_8: 349.6,
    };

    const glucernaMultipliers = {
      glucerna_2: 91.2,
      glucerna_4: 182.4,
      glucerna_6: 273.6,
      glucerna_8: 364.8,
    };

    const prosureMultipliers = {
      prosure_2: 67.2,
      prosure_4: 134.4,
      prosure_6: 201.6,
      prosure_8: 268.8,
    };

    const neproMultipliers = {
      nepro_1: 401,
      nepro_2: 802,
      nepro_3: 1203,
    };

    const enteralProductMultipliers = {
      ensure_2: ensureMultipliers.ensure_2,
      ensure_4: ensureMultipliers.ensure_4,
      ensure_6: ensureMultipliers.ensure_6,
      ensure_8: ensureMultipliers.ensure_8,
      glucerna_2: glucernaMultipliers.glucerna_2,
      glucerna_4: glucernaMultipliers.glucerna_4,
      glucerna_6: glucernaMultipliers.glucerna_6,
      glucerna_8: glucernaMultipliers.glucerna_8,
      prosure_2: prosureMultipliers.prosure_2,
      prosure_4: prosureMultipliers.prosure_4,
      prosure_6: prosureMultipliers.prosure_6,
      prosure_8: prosureMultipliers.prosure_8,
      nepro_1: neproMultipliers.nepro_1,
      nepro_2: neproMultipliers.nepro_2,
      nepro_3: neproMultipliers.nepro_3,
    };

    return enteralProductMultipliers[product] || 0;
  }, []); // Remove the dependencies

  const caloriesPerMealAdjustedTEE = useMemo(() => {
    if (tee !== null && enteralProduct !== "none") {
      const multiplier = getMultiplierForEnteralProduct(enteralProduct);
      const adjustedTEE = tee - multiplier;
      const totalDailyCalories = adjustedTEE;
      return calculateCaloriesPerMeal(totalDailyCalories);
    } else if (tee !== null) {
      const totalDailyCalories = tee;
      return calculateCaloriesPerMeal(totalDailyCalories);
    }
    return {};
  }, [
    tee,
    enteralProduct,
    calculateCaloriesPerMeal,
    getMultiplierForEnteralProduct,
  ]);

  // Function to format enteral product and scoop count
  const formatTotalScoop = (product) => {
    const productParts = product.split("_");
    if (productParts.length === 2) {
      const productName =
        productParts[0].charAt(0).toUpperCase() + productParts[0].slice(1);
      const scoopCount = productParts[1];
      return `${productName} ${scoopCount} scoops`;
    } else {
      return "None";
    }
  };

  // ResetValues
  const resetValues = () => {
    setHasCalculated(false);

    // Reset input values
    setAge("");
    setWeight("");
    setHeight("");
    setGender("male");
    setTdeeActivityLevel("none");
    setBeeActivityFactor("none");
    setBeeStressLevel("none");
    setEnteralProduct("none");
    setBeeStressLevel("none");
    setNumberOfMeals(3);

    // Reset calculated values
    setTdee(null);
    setBee(null);
    setTee(null);
    setBMI(null);
    setIdealWeight(null);

    // Reset error messages
    setAgeError("");
    setWeightError("");
    setHeightError("");

    //downloadbutton
    setShowDownloadButton(null);
  };

  const resetValuesCallback = useCallback(resetValues, []);
  useEffect(() => {
    if (calculatedPDF) {
      setCalculatedPDF(false);
      if (!hasCalculated) {
        resetValuesCallback();
      }
    }
  }, [calculatedPDF, resetValuesCallback, hasCalculated]);

  return (
    <div className="mx-auto max-w-2xl py-20 sm:py-20 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 sm:space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Your Health Data
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Make sure the information is correct for the best result. If it’s
            not relevant, enter ‘none’ or leave it by default.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Gender
              </label>
              <div className="mt-2">
                <select
                  id="gender"
                  name="gender"
                  autoComplete="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="sedentary">Male</option>
                  <option value="lightlyActive">Female</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Age
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    setAgeError(""); // Reset the error message
                  }}
                  placeholder="Your Age"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div className="text-red-500">
                  {ageError && <p>{ageError}</p>}
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Weight (kg)
              </label>
              <div className="mt-2">
                <input
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    setWeightError(""); // Reset the error message
                  }}
                  placeholder="Your Weight"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div className="text-red-500">
                  {weightError && <p>{weightError}</p>}
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Height (cm)
              </label>
              <div className="mt-2">
                <input
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    setHeightError(""); // Reset the error message
                  }}
                  placeholder="Your Height"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div className="text-red-500">
                  {heightError && <p>{heightError}</p>}
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                BMR Activity Level
              </label>
              <span class="text-xs ">
                <em>* For healthy individual / not hospitalized</em>
              </span>
              <div className="mt-2">
                <select
                  id="bmr"
                  value={tdeeActivityLevel}
                  onChange={(e) => setTdeeActivityLevel(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="none">None</option>
                  <option value="sedentary">
                    Sedentary (little or no exercise)
                  </option>
                  <option value="lightlyActive">
                    Lightly Active (exercise/sports 1-3 days/week)
                  </option>
                  <option value="moderatelyActive">
                    Moderately Active (exercise/sports 3-5 days/week)
                  </option>
                  <option value="veryActive">
                    Very Active (exercise/sports 6-7 days a week)
                  </option>
                  <option value="extraActive">
                    Extra Active (sports & physical job)
                  </option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                BMR Activity level
              </label>
              <span class="text-xs ">
                <em>* For hospitalized adult patient</em>
              </span>
              <div className="mt-2">
                <select
                  id="stress"
                  value={beeActivityFactor}
                  onChange={(e) => setBeeActivityFactor(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option
                    value="none"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    None
                  </option>
                  <optgroup
                    label="Resting"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="sedated">
                      lying still, sedated or asleep
                    </option>
                    <option value="conscious">lying still, conscious </option>
                    <option value="bedrest">
                      bedrest (moving self around bed)
                    </option>
                    <option value="bedrestLong">
                      sitting out of bed long periods
                    </option>
                    <option value="mobilising">
                      mobilising occasionally on ward
                    </option>
                  </optgroup>
                  <optgroup
                    label="Sedentary / light activity"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="mobFreq">
                      mobilising frequently on ward
                    </option>
                    <option value="physio">
                      +regular, intensive physiotherapy
                    </option>
                  </optgroup>
                  <optgroup
                    label="Moderate activity"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="conmove">
                      continuous movement/slow walking
                    </option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Stress / Injury Factors
              </label>
              <span class="text-xs ">
                <em>* For hospitalized adult patient</em>
              </span>
              <div className="mt-2">
                <select
                  id="stress"
                  value={beeStressLevel}
                  onChange={(e) => setBeeStressLevel(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option
                    value="none"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    None
                  </option>
                  <optgroup
                    label="Medical"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="medical">
                      inflammatory bowel disease / liver / pancreatic disease
                    </option>
                  </optgroup>
                  <optgroup
                    label="Surgical"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="surgical">transplant / fistula</option>
                  </optgroup>
                  <optgroup
                    label="Cancer"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="cancer">tumour / leukaemia</option>
                  </optgroup>
                  <optgroup
                    label="Trauma"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="trauma">
                      skeletal injury / head injury / minor burns
                    </option>
                  </optgroup>
                  <optgroup
                    label="Sepsis"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="sepsis">& other major infection</option>
                  </optgroup>
                  <optgroup
                    label="Burn"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="majorBurns">burns</option>
                  </optgroup>
                  <optgroup
                    label="Critical illness or Major surgery/Trauma"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="ventilation">
                      with mechanical ventilation
                    </option>
                    <option value="afterVentilation">
                      after the first week, for next 2-3 weeks
                    </option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Enteral / Oral Supplement
              </label>
              <span class="text-xs ">
                <em>* For hospitalized adult patient</em>
              </span>
              <div className="mt-2">
                <select
                  id="stress"
                  value={enteralProduct}
                  onChange={(e) => setEnteralProduct(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option
                    value="none"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    None
                  </option>
                  <optgroup
                    label="Ensure"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="ensure_2">Ensure 2x scoop</option>
                    <option value="ensure_4">Ensure 4x scoop</option>
                    <option value="ensure_6">Ensure 6x scoop</option>
                    <option value="ensure_8">Ensure 8x scoop</option>
                  </optgroup>
                  <optgroup
                    label="Glucerna"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="glucerna_2">Glucerna 2x scoop</option>
                    <option value="glucerna_4">Glucerna 4x scoop</option>
                    <option value="glucerna_6">Glucerna 6x scoop</option>
                    <option value="glucerna_8">Glucerna 8x scoop</option>
                  </optgroup>
                  <optgroup
                    label="Prosure"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="prosure_2">Prosure 2x scoop</option>
                    <option value="prosure_4">Prosure 4x scoop</option>
                    <option value="prosure_6">Prosure 6x scoop</option>
                    <option value="prosure_8">Prosure 8x scoop</option>
                  </optgroup>
                  <optgroup
                    label="Nepro - 220ml"
                    className="text-sm font-medium leading-6 text-gray-900"
                  >
                    <option value="nepro_1">Nepro 1x bottle</option>
                    <option value="nepro_2">Nepro 2x bottle</option>
                    <option value="nepro_3">Nepro 3x bottle</option>
                  </optgroup>
                </select>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Number of Meals / Day
              </label>
              <span class="text-xs ">
                <em>* Please pick the number of meals</em>
              </span>
              <div className="mt-2">
                <select
                  id="meals"
                  value={numberOfMeals}
                  onChange={(e) => setNumberOfMeals(parseInt(e.target.value))}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value={3}>Three Meals a Day</option>
                  <option value={4}>Four Meals a Day</option>
                  <option value={5}>Five Meals a Day</option>
                  <option value={6}>Six Meals a Day</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-12 flex items-center justify-center gap-x-6">
            <button
              onClick={calculate}
              className="button w-40 h-10 bg-blue-500 rounded-lg cursor-pointer select-none
    active:translate-y-2  active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
    active:border-b-[0px]
    transition-all duration-150 [box-shadow:0_10px_0_0_#1b6ff8,0_15px_0_0_#1b70f841]
    border-b-[1px] border-blue-400 font-semibold text-white"
            >
              Generate
            </button>
            <button
              onClick={resetValuesCallback}
              className="button w-40 h-10 bg-blue-500 rounded-lg cursor-pointer select-none
    active:translate-y-2  active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
    active:border-b-[0px]
    transition-all duration-150 [box-shadow:0_10px_0_0_#1b6ff8,0_15px_0_0_#1b70f841]
    border-b-[1px] border-blue-400 font-semibold text-white"
            >
              Reset
            </button>
          </div>
          {tdee !== null && (
            <div ref={ref}>
              {tdeeActivityLevel === "none" &&
                beeActivityFactor === "none" &&
                beeStressLevel === "none" && (
                  <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
                    <div className="bg-green-100 rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-bold mb-2">
                        💪 Body Mass Index:
                      </h2>
                      <p>{bmi} kg/m2</p>
                      <p className="mt-4 font-semibold">
                        {bmiCategory && `Category: ${bmiCategory}`}
                      </p>
                      <span class="text-xs">
                        <em>WHO classification of BMI (1998)</em>
                      </span>
                    </div>
                    <div className="bg-yellow-100 rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-bold mb-2">
                        🏋Ideal Weight:
                      </h2>
                      <p>{idealWeight} kg</p>

                      <span class="text-xs">
                        <em>Based on target BMI 22.5 kg/m2 </em>
                      </span>
                      <p className="mt-4">
                        The ideal weight is a target weight associated with
                        optimal health and well-being based on the individual's
                        height.
                      </p>
                    </div>
                  </div>
                )}

              {tdeeActivityLevel !== "none" &&
                beeActivityFactor === "none" &&
                beeStressLevel === "none" && (
                  <div className="bg-orange-100 p-4 rounded col-span-2 md:col-span-1 shadow-md mt-10">
                    <h2 className="text-xl font-bold mb-4">Energy Metrics</h2>
                    <p>
                      <strong>
                        🔥 Total Daily Energy Expenditure (TDEE): {tdee}{" "}
                        kcal/day{" "}
                      </strong>
                    </p>
                    <span class="text-xs">
                      <em>
                        Harris JA, Benedict FG. A biometric study of human basal
                        metabolism (1918)
                      </em>
                    </span>
                    <p className="mt-4">
                      Calories that your body burns daily depending on your
                      basal metabolic rate (BMR) and physical activity level
                      factor
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-green-100 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-2">
                          💪 Body Mass Index:
                        </h2>
                        <p>{bmi} kg/m2</p>
                        <p className="mt-4 font-semibold">
                          {bmiCategory && `Category: ${bmiCategory}`}
                        </p>
                        <span class="text-xs">
                          <em>WHO classification of BMI (1998)</em>
                        </span>
                      </div>
                      <div className="bg-yellow-100 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-2">
                          🏋Ideal Weight:
                        </h2>
                        <p>{idealWeight} kg</p>
                        <span class="text-xs">
                          <em>Based on target BMI 22.5 kg/m2 </em>
                        </span>
                      </div>
                    </div>
                    <div className="bg-cyan-100 rounded-lg shadow-md p-6 mt-6">
                      <div>
                        <h3 className="text-lg font-bold mb-6">
                          ⚡Meal Planning
                        </h3>
                        {Object.keys(caloriesPerMealTDEE).map((meal, index) => (
                          <p key={index} className="mt-2">
                            {meal.charAt(0).toUpperCase() + meal.slice(1)}:{" "}
                            {caloriesPerMealTDEE[meal]} kcal
                          </p>
                        ))}
                      </div>
                      <h3 className="text-lg mt-6 font-bold mb-6">
                        🍽 Meal Distribution Guidelines
                      </h3>
                      <table class="table-auto w-full">
                        <thead>
                          <tr>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Number of Meals
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Breakfast
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Morning Snack
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Lunch
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Afternoon Snack
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Dinner
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Supper
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              Three Meals
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              30 - 35%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              {" "}
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              35 - 40%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              {" "}
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 35%
                            </td>
                          </tr>
                          <tr>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              Four Meals
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              35 - 40%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              {" "}
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25-30%
                            </td>
                          </tr>
                          <tr>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              Five Meals
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              35 - 40%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              15 - 20%
                            </td>
                          </tr>
                          <tr>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              Six Meals
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {tdeeActivityLevel === "none" &&
                beeActivityFactor !== "none" &&
                beeStressLevel !== "none" && (
                  <div className="bg-orange-100 p-4 rounded col-span-2 md:col-span-1 shadow-md mt-10">
                    <h2 className="text-xl font-bold mb-4">Energy Metrics</h2>
                    <p>
                      <strong>
                        🔥 Total Energy Expenditure (TEE):{" "}
                        {enteralProduct !== "none"
                          ? tee - getMultiplierForEnteralProduct(enteralProduct)
                          : tee}{" "}
                        kcal/day
                      </strong>
                    </p>
                    <span class="text-xs">
                      <em>* Exluded enteral/oral supplement</em>
                    </span>
                    <p className="mt-4">
                      Calories that your body burns daily depending on your
                      basal metabolic rate (BMR), physical activity level and
                      stress / injury factor
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-green-100 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-2">
                          💪 Body Mass Index:
                        </h2>
                        <p>{bmi} kg/m2</p>
                        <p className="mt-4 font-semibold">
                          {bmiCategory && `Category: ${bmiCategory}`}
                        </p>
                        <span class="text-xs">
                          <em>WHO classification of BMI (1998)</em>
                        </span>
                      </div>
                      <div className="bg-yellow-100 rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-2">
                          🏋Ideal Weight:
                        </h2>
                        <p>{idealWeight} kg</p>
                        <span class="text-xs">
                          <em>Based on target BMI 22.5 kg/m2 </em>
                        </span>
                      </div>
                    </div>
                    <div className="bg-fuchsia-100 rounded-lg shadow-md p-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                          <h3 className="text-lg font-bold mb-6">
                            ⚡Meal Planning
                          </h3>
                          {Object.keys(caloriesPerMealAdjustedTEE).map(
                            (meal, index) => (
                              <p key={index} className="mt-2">
                                {meal.charAt(0).toUpperCase() + meal.slice(1)}:{" "}
                                {caloriesPerMealAdjustedTEE[meal]} kcal
                              </p>
                            )
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold mb-6">
                            💊 Enteral / Oral Supplement
                          </h3>
                          <p>
                            <strong>
                              Product:{" "}
                              {enteralProduct !== "none"
                                ? formatTotalScoop(enteralProduct)
                                : "None"}
                            </strong>
                          </p>
                          {enteralProduct !== "none" && (
                            <p>
                              <strong>
                                Total Calories:{" "}
                                {getMultiplierForEnteralProduct(enteralProduct)}{" "}
                                kcal
                              </strong>
                            </p>
                          )}
                          <div className="mt-4">
                            <span class="text-xs">
                              <em>
                                Please divide it into suitable meals time etc.
                                morning snack, afternoon snack and supper
                              </em>
                            </span>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg mt-6 font-bold mb-4">
                        🍽 Meal Distribution Guidelines
                      </h3>
                      <table class="table-auto w-full">
                        <thead>
                          <tr>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Number of Meals
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Breakfast
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Morning Snack
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Lunch
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Afternoon Snack
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Dinner
                            </th>
                            <th class="w-1/6 px-4 py-2 text-xs text-center">
                              Supper
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              Three Meals
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              30 - 35%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              {" "}
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              35 - 40%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              {" "}
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 35%
                            </td>
                          </tr>
                          <tr>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              Four Meals
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              35 - 40%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              {" "}
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25-30%
                            </td>
                          </tr>
                          <tr>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              Five Meals
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              35 - 40%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              15 - 20%
                            </td>
                          </tr>
                          <tr>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              Six Meals
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              25 - 30%
                            </td>
                            <td class="w-1/6 border-2 px-4 py-2 text-xs text-center">
                              5 - 10%
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>
          )}
          {showDownloadButton && (
            <div className="flex items-center justify-center mt-10">
              <button
                onClick={handlePrintToPDF}
                disabled={!hasCalculated}
                className="button w-40 h-10 bg-blue-500 rounded-lg cursor-pointer select-none
            active:translate-y-2  active:[box-shadow:0_0px_0_0_#1b6ff8,0_0px_0_0_#1b70f841]
            active:border-b-[0px]
            transition-all duration-150 [box-shadow:0_10px_0_0_#1b6ff8,0_15px_0_0_#1b70f841]
            border-b-[1px] border-blue-400 font-semibold text-white"
              >
                Download
              </button>
            </div>
          )}
        </div>

        <div class="border-b border-gray-900/10 pb-12">
          <h2 class="text-base font-semibold leading-7 text-gray-900">
            References
          </h2>
          <ol class="list-decimal pl-4">
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  Nuttall FQ. Body Mass Index: Obesity, BMI, and Health: A
                  Critical Review.; Nutrition Today; May 2015
                </em>
              </span>
            </li>
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  Pai MP, Paloucek FP. The origin of the "ideal" body weight
                  equations; Annals of Pharmacotherapy; September 2000
                </em>
              </span>
            </li>
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  M. Spodaryk and K. Kobylarz The Usability of Harris-Benedict
                  and Curreri Equations in Nutritional Management of Thermal
                  Injuries; Ann Burns Fire Disasters; Sep 2005
                </em>
              </span>
            </li>
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  Roza AM, Shizgal HM. The Harris Benedict equation reevaluated:
                  resting energy requirements and the body cell mass.; The
                  American Journal of Clinical Nutrition; July 1984
                </em>
              </span>
            </li>
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  Harris JA, Benedict FG. A Biometric Study of Human Basal
                  Metabolism.; The Proceedings of the National Academy of
                  Sciences (PNAS); 1918
                </em>
              </span>
            </li>
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  Institute of Medicine Dietary Reference Intakes for Energy,
                  Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein,
                  and Amino Acids; The National Academies Press; 2005
                </em>
              </span>
            </li>
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  Institute of Medicine (US) Committee to Review Child and Adult
                  Care Food Program Meal Requirements; Murphy SP, Yaktine AL,
                  West Suitor C, et al., Child and Adult Care Food Program:
                  Aligning Dietary Guidance for All.; Washington (DC): National
                  Academies Press (US); 2011
                </em>
              </span>
            </li>
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  James WPT. From SDA to DIT to TEF. In: Kinney JM, Tucker HN,
                  eds. Energy Metabolism: Tissue Determinants and Cellular
                  Corollaries. New York: Raven Press, 1992; 163-86.
                </em>
              </span>
            </li>
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  UK Department of Health. Report on health and social subjects
                  41: dietary reference values for food energy and nutrients for
                  the United Kingdom. Report of the Panel on Dietary Reference
                  Values of the Committee on Medical Aspects of Food Policy.
                  London: Her Majesty's Stationery Office; 1991.
                </em>
              </span>
            </li>
            <li class="mt-1 text-sm leading-6 text-gray-600 italic">
              <span class="text-xs">
                <em>
                  WHO (1998). Obesity: Prevention andManaging the Global
                  Epidemic. Report of a WHO Consultation on Obesity.World Health
                  Organization, Geneva.
                </em>
              </span>
            </li>
          </ol>
        </div>
        <span class="block text-sm text-gray-600 sm:text-center">
          © 2021 - 2024{" "}
          <a href="https://vceed.com/" class="hover:underline">
            Made with ❤️ by Naz M
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </div>
  );
};
export default DietAssessment;
