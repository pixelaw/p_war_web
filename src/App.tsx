import UPNG from 'upng-js';
import './App.css'
import Viewport from "./components/Viewport.tsx";
import {useEffect, useRef, useState} from "react";
import {Coordinate, Pixel} from "./types.ts";
import {useSimplePixelStore} from "./hooks/SimplePixelStore.ts";
import {useSimpleTileStore} from "./hooks/SimpleTileStore.ts";
import {clearIdb} from "./utils.ts";

const DEFAULT_ZOOM = 100
const DEFAULT_CENTER: Coordinate = [4294967294,0]

async function fillPixelData(imageUrl: string, setPixels: (pixels: { key: string, pixel: Pixel }[]) => void) {
    // Fetch PNG file
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();

    // Decode PNG file
    const decodedImage = UPNG.decode(arrayBuffer);
    const rgbaValues: Uint8Array = new Uint8Array(UPNG.toRGBA8(decodedImage)[0]);

    const pixels = []

    for (let y = 0; y < decodedImage.height; y++) {
        for (let x = 0; x < decodedImage.width; x++) {
            const idx = (decodedImage.width * y + x) << 2;

            // Get RGB color from PNG
            const r = rgbaValues[idx];
            const g = rgbaValues[idx + 1];
            const b = rgbaValues[idx + 2];
            const a = rgbaValues[idx + 3];
            // Encode RGB color to int
            const color = (r << 24) | (g << 16) | (b << 8) | a;

            pixels.push({
                key: `${x},${y}`, pixel: {
                    action: "", color, id: "", owner: "", text: ""
                }
            })
        }
    }
    setPixels(pixels)
}

function App() {
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
    const [center, setCenter] = useState<Coordinate>(DEFAULT_CENTER);

    const resetViewport = () => {
        setZoom(DEFAULT_ZOOM);
        setCenter(DEFAULT_CENTER);
    };

    const centerUp = () => {
        setCenter([center[0], center[1]+1000]);
    };

    const filledRef = useRef(false);

    const pixelStore = useSimplePixelStore();
    const tileStore = useSimpleTileStore();

    useEffect(() => {
        if (!filledRef.current) {

            const fetchData = async () => {
                await fillPixelData("/kq3.png", pixelStore.setPixels);
            };
            fetchData();
            filledRef.current = true;
        }
    }, []);

    return (
        <>
            <button onClick={centerUp}>centerUp</button>
            <button onClick={resetViewport}>reset</button>
            <button onClick={clearIdb}>Clear IndexedDB</button>
            <Viewport
                tileStore={tileStore}
                pixelStore={pixelStore}
                dimensions={[800, 400]}
                zoom={zoom}
                center={center}
                onWorldviewChange={onWorldviewChange}
                onCenterChange={onCenterChange}
                onZoomChange={onZoomChange}
            />
        </>
    )
}

function onZoomChange(newZoom: number) {
    console.log("onZoomChange", newZoom)
}

function onWorldviewChange(_newWorldview: number[][]) {
    // console.log("onWorldviewChange", newWorldview)
}

function onCenterChange(newCenter: number[]) {
    console.log("onCenterChange", newCenter)

}

export default App
