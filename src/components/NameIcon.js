import React, { useMemo } from "react";
const NameIcon = ({ name, size = 50, textColor = "#fff" }) => {
  const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
  const bgColor = useMemo(() => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return randomColor;
  }, []);

  const circleStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: bgColor,
    color: textColor,
    borderRadius: "50%",
    minWidth: `${size}px`,
    maxWidth: `${size}px`,
    maxHeight: `${size}px`,
    minHeight: `${size}px`,
    fontSize: `${size / 2}px`,
    fontWeight: "bold",
    textAlign: "center",
    border: "1px solid lightgrey",
  };

  return <div style={circleStyle}>{firstLetter}</div>;
};

export default NameIcon;
