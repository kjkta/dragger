import React from "react";
import { render } from "react-dom";
import useRotator from "use-rotator";

function useDrag(initialPosition, enableDragging = true) {
  const ref = React.useRef(null);
  const [position, setPosition] = React.useState(initialPosition);
  const [isDragging, dragPosition] = useDragging(ref.current);

  // React.useEffect(function() {
  //   if (ref.current && enableDragging && isDragging) {
  //     setPosition({ x, y });
  //   }
  // }, []);

  return [
    ref,
    {
      x: dragPosition
        ? dragPosition.clientX - (ref.current ? ref.current.clientWidth / 2 : 0)
        : 0,
      y: dragPosition
        ? dragPosition.clientY -
          (ref.current ? ref.current.clientHeight / 2 : 0)
        : 0
    }
  ];
}

function App({ children, enableDragging = true, initialDegree = 0 }) {
  const [rotatableRef, rotateHandleRef, degree, isDragging] = useRotator(
    initialDegree,
    enableDragging
  );

  const [draggableRef, { x, y }] = useDrag();

  const color = "blue";
  const size = 10;
  const height = 30;

  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          transform: `rotate(${degree}deg)`
        }}
      >
        {enableDragging && (
          <div
            ref={rotateHandleRef}
            style={{
              cursor: "grab",
              height,
              width: 2,
              backgroundColor: color,
              position: "absolute",
              left: "50%",
              top: -height,
              transform: "translateX(-50%)"
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  top: -size,
                  backgroundColor: color,
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  cursor: "grab"
                }}
              />
            </div>
          </div>
        )}
        <div
          ref={rotatableRef}
          style={{
            border: "1px solid red",
            display: "inline-block"
          }}
        >
          <div
            ref={draggableRef}
            style={{
              width: 100,
              height: 200,
              backgroundColor: "yellow"
            }}
          >
            {isDragging.toString()}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const MOUSE_DOWN = "MOUSE_DOWN";
const MOUSE_MOVE = "MOUSE_MOVE";
const MOUSE_UP = "MOUSE_UP";
function useDragging(el) {
  const [{ mouseDragging, dragPosition }, dispatch] = React.useReducer(
    function(state, action) {
      switch (action.type) {
        case MOUSE_DOWN:
          return {
            mouseDown: true,
            mouseDragging: false,
            dragPosition: action.payload
          };
        case MOUSE_MOVE:
          return {
            ...state,
            mouseDragging: state.mouseDown ? true : false,
            dragPosition: state.mouseDown ? action.payload : state.dragPosition
          };
        case MOUSE_UP:
          return {
            mouseDown: false,
            mouseDragging: false,
            dragPosition: state.mouseDown ? action.payload : state.dragPosition
          };
        default:
          return state;
      }
    },
    {
      mouseDown: false,
      mouseDragging: false,
      dragPosition: { clientX: null, clientY: null }
    }
  );

  function handleMouseDown({ offsetX, offsetY, clientX, clientY }) {
    dispatch({
      type: MOUSE_DOWN,
      payload: { offsetX, offsetY, clientX, clientY }
    });
  }

  function handleMouseMove({ offsetX, offsetY, clientX, clientY }) {
    dispatch({
      type: MOUSE_MOVE,
      payload: { offsetX, offsetY, clientX, clientY }
    });
  }

  function handleMouseUp({ offsetX, offsetY, clientX, clientY }) {
    dispatch({
      type: MOUSE_UP,
      payload: { offsetX, offsetY, clientX, clientY }
    });
  }

  React.useEffect(() => {
    if (el) {
      el.addEventListener("mousedown", handleMouseDown);
      // Listen to any mouse move & mouse up in the document
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      if (el) {
        el.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [el]);

  return [mouseDragging, dragPosition];
}

render(
  <div style={{ margin: 50 }}>
    <App />
  </div>,
  document.getElementById("root")
);
