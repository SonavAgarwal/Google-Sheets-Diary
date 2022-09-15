import React, { useRef, useEffect, useState } from "react";
import { CirclePicker } from "react-color";
import "../styles/DrawingPad.css";

const maxUndo = 7;
const drawingColors = [
    "black",
    "#ff7094",
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#607d8b",
    "#4f4f4f",
];

function DrawingPad({ dataUrl, defaultDataUrl, onChange }) {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [canvasReady, setCanvasReady] = useState(false);

    const [color, setColor] = useState("black");
    const [lineWidth, setLineWidth] = useState(25);
    const [isDrawing, setIsDrawing] = useState(false);
    const [prevPos, setPrevPos] = useState({});

    const [dataUrls, setDataUrls] = useState([]);

    useEffect(
        function () {
            console.log("addEventListener2");
            canvasRef.current.addEventListener("touchmove", handleTouchMove, { passive: false });
            return function () {
                if (canvasRef.current) canvasRef.current.removeEventListener("touchmove", handleTouchMove);
            };
        },
        [canvasReady, canvasRef, contextRef, isDrawing, color, lineWidth]
    );

    useEffect(
        function () {
            if (canvasRef) {
                const canvas = canvasRef.current;
                canvas.width = 300;
                canvas.height = 300;
                const context = canvas.getContext("2d");
                contextRef.current = context;
                context.lineCap = "round";

                clearCanvas(context);

                setCanvasReady(true);
            }
        },
        [canvasRef]
    );

    function clearCanvas(context) {
        context.beginPath();
        context.fillStyle = "white";
        context.fillRect(0, 0, 10000, 10000);
        context.stroke();
    }

    useEffect(
        function () {
            contextRef.current.strokeStyle = color;
        },
        [color]
    );
    useEffect(
        function () {
            contextRef.current.lineWidth = lineWidth;
        },
        [lineWidth]
    );

    function overrideCanvas(newDataUrl) {
        var img = new Image();
        img.onload = function () {
            contextRef.current.drawImage(img, 0, 0); // Or at whatever offset you like
            onChange(dataUrl);
        };
        img.src = newDataUrl;
    }

    // useEffect(
    //     function () {
    //         if (dataUrl && canvasReady) {
    //             overrideCanvas(dataUrl);
    //             saveDataUrlToUndo(dataUrl);
    //         }
    //     },
    //     [dataUrl, canvasReady]
    // );

    useEffect(
        function () {
            if (defaultDataUrl && canvasReady) {
                console.log("here");
                overrideCanvas(defaultDataUrl);
                saveDataUrlToUndo(defaultDataUrl);
            } else if (canvasReady) {
                saveDataUrlToUndo(canvasRef.current.toDataURL());
            }
        },
        [defaultDataUrl, canvasReady]
    );

    function handleMouseDown(event) {
        const { offsetX, offsetY } = event.nativeEvent;

        // let actualPos = getParentOffsets(event, canvasRef.current);
        // startDraw(actualPos.x, actualPos.y);
        startDraw(offsetX, offsetY);
    }
    function handeTouchStart(event) {
        const touches = event.touches || [];
        const touch = touches[0] || {};

        startDraw(touch.pageX - canvasRef.current.offsetLeft, touch.pageY - canvasRef.current.offsetTop);
    }

    function startDraw(x, y) {
        setIsDrawing(true);
        // setPrevPos({ x, y });
        prevPos.x = x;
        prevPos.y = y;
        // console.log("setisdraw true");
    }

    function saveDataUrlToUndo(newDataUrl) {
        let newDataUrlArray = [...dataUrls];

        newDataUrlArray.push(newDataUrl);
        if (newDataUrlArray.length > maxUndo) {
            newDataUrlArray.shift();
        }
        setDataUrls(newDataUrlArray);

        console.log(newDataUrlArray);

        onChange(newDataUrl);
    }

    function handleMouseUp() {
        setIsDrawing(false);

        saveDataUrlToUndo(canvasRef.current.toDataURL());
    }

    function handleMouseLeave() {
        // setIsDrawing(false);
    }

    function handleMouseMove(event) {
        const { offsetX, offsetY } = event.nativeEvent;

        // console.log("hi");
        // console.log(getParentOffsets(event, canvasRef.current));
        // console.log({ offsetX, offsetY });
        // let actualPos = getParentOffsets(event, canvasRef.current);
        // draw(actualPos.x, actualPos.y);
        draw(offsetX, offsetY);
    }
    function handleTouchMove(event) {
        console.log("heyge");
        event.preventDefault();
        const touches = event.touches || [];
        const touch = touches[0] || {};

        let x = touch.pageX - canvasRef.current.offsetLeft;
        let y = touch.pageY - canvasRef.current.offsetTop;
        draw(x, y);
        // setPrevPos({ x, y });
    }
    function draw(x, y) {
        if (isDrawing) {
            let maxStringLength = color === "white" ? 0 : 25;
            let stringDist = distanceBetweenTwoPoints(prevPos, { x, y });

            // contextRef.current.lineWidth = 1;
            // contextRef.current.strokeStyle = "black";
            // contextRef.current.beginPath();
            // contextRef.current.moveTo(x, y);
            // contextRef.current.lineTo(x, y);
            // contextRef.current.stroke();
            // contextRef.current.lineWidth = lineWidth;
            // contextRef.current.strokeStyle = color;

            if (stringDist > maxStringLength) {
                contextRef.current.beginPath();
                let stringAngle = Math.atan2(y - prevPos.y, x - prevPos.x);
                let distToMove = stringDist - maxStringLength;
                let nX = prevPos.x + distToMove * Math.cos(stringAngle);
                let nY = prevPos.y + distToMove * Math.sin(stringAngle);
                contextRef.current.moveTo(prevPos.x, prevPos.y);
                contextRef.current.lineTo(nX, nY);
                contextRef.current.stroke();
                prevPos.x = nX;
                prevPos.y = nY;
            }
        }
    }

    function undoEdit() {
        let newDataUrlArray = [...dataUrls];
        newDataUrlArray.pop();
        overrideCanvas(newDataUrlArray[newDataUrlArray.length - 1]);
        console.log(newDataUrlArray);

        setDataUrls(newDataUrlArray);
    }

    return (
        <div className='drawing-pad'>
            <div>
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handeTouchStart}
                    // onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}></canvas>
            </div>
            <div className='drawing-pad-controls'>
                <div className='brush-preview' style={{ width: lineWidth + "px", height: lineWidth + "px", backgroundColor: color }}></div>
                <div className='color-picker-container'>
                    <CirclePicker
                        colors={drawingColors}
                        color={color}
                        onChange={function (c) {
                            setColor(c.hex);
                        }}
                        // circleSize={30}
                        // circleSpacing={20}
                        // width={250}
                        circleSize={28}
                        circleSpacing={10}
                        width={266}
                    />
                </div>
                <input
                    type={"range"}
                    className='brush-size-range'
                    min={5}
                    max={100}
                    step={5}
                    value={lineWidth}
                    onChange={function (e) {
                        setLineWidth(e.target.value);
                    }}></input>
                <div>
                    <button
                        type='button'
                        style={{ marginRight: "1rem", opacity: dataUrls.length > 1 ? 1 : 0.5 }}
                        disabled={dataUrls.length <= 1}
                        className='button'
                        onClick={function () {
                            undoEdit();
                        }}>
                        ↩️
                    </button>
                    <button
                        type='button'
                        style={{ marginRight: "1rem" }}
                        className='button'
                        onClick={function () {
                            setColor("white");
                            // setLineWidth(40);
                        }}>
                        Eraser
                    </button>
                    <button
                        type='button'
                        className='button'
                        onClick={function () {
                            clearCanvas(contextRef.current);
                        }}>
                        Clear
                    </button>
                </div>
                {/* <button
                    onClick={function () {
                        console.log(canvasRef.current.toDataURL());
                    }}>
                    get dataurl
                </button> */}
            </div>
        </div>
    );
}

function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function distanceBetweenTwoPoints(a, b) {
    let leg1 = a.x - b.x;
    let leg2 = a.y - b.y;
    return Math.sqrt(leg1 * leg1 + leg2 * leg2);
}

export default DrawingPad;
