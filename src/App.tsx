import "./App.css";
import { useEffect, useState } from "react";
import GridRow from "./GridRow";

function App() {
  const [values, setValues] = useState<string[][]>(
    Array(6).fill(Array(5).fill(""))
  );
  const [activeRow, setActiveRow] = useState<number>(0);

  useEffect(() => {
    const firstInput = document.querySelector<HTMLInputElement>(".grid-input");
    firstInput?.focus();
  }, []);

  return (
    <div className="grid-container">
      <h1>ETERMO</h1>
      {values.map((row, rowIndex) => (
        <GridRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          activeRow={activeRow}
          setActiveRow={setActiveRow}
          values={values}
          setValues={setValues}
        />
      ))}
    </div>
  );
}

export default App;
