import React, { useRef, useEffect } from "react";
import Spline from "@splinetool/react-spline";

export default function Hero3D({ onSelect }) {
  const splineRef = useRef();

  const handleLoad = (splineApp) => {
    splineRef.current = splineApp;
  };

  const handleClick = (e) => {
    const clickedObject = e.target;
    const id = clickedObject.name;

    // Sesuaikan dengan nama objek di Spline
    if (id === "coffee_cup") {
      onSelect({ name: "Coffee", price: 25000 });
    } else if (id === "latte_cup") {
      onSelect({ name: "Latte", price: 30000 });
    } else if (id === "croissant") {
      onSelect({ name: "Croissant", price: 20000 });
    }
  };

  return (
    <div className="w-full h-screen">
      <Spline
        scene="https://prod.spline.design/e65429c9-8ba8-41e9-9288-6abfee8153c7/scene.splinecode"
        onLoad={handleLoad}
        onClick={handleClick}
      />
    </div>
  );
}
