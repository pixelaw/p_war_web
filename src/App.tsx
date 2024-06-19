import styles from './App.module.css';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bounds, Coordinate } from "./webtools/types.ts";
import { useSimpleTileStore } from "./webtools/hooks/SimpleTileStore.ts";
import { clearIdb } from "./webtools/utils.ts";
import { useToriiPixelStore } from "./webtools/hooks/ToriiPixelStore.ts";
import { useUpdateService } from "./webtools/hooks/UpdateService.ts";
import Viewport from "./webtools/components/Viewport";
import SimpleColorPicker from "./webtools/components/ColorPicker/SimpleColorPicker.tsx";
import MenuBar from "./components/MenuBar.tsx";
import Apps from "./components/Apps.tsx";
// import ProposalList from './components/ProposalList.tsx';
import ProposalListForMain from './components/ProposalListForMain.tsx';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import NewProposalPopupForMain from './components/NewProposalPopupForMain.tsx';

// import { Link } from "react-router-dom";

const ZOOM_PRESETS = { tile: 100, pixel: 3100 };
const DEFAULT_ZOOM = ZOOM_PRESETS.pixel;
const DEFAULT_CENTER: Coordinate = [4294967294, 0];

function App() {
    const [viewportZoom, setViewportZoom] = useState<number>(DEFAULT_ZOOM);
    const [center, setCenter] = useState<Coordinate>(DEFAULT_CENTER);
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
    const [isProposalListVisible, setIsProposalListVisible] = useState(true);
    const updateService = useUpdateService(`ws://localhost:3001/tiles`); // TODO url configurable
    const pixelStore = useToriiPixelStore("http://localhost:8080"); // TODO url configurable
    const tileStore = useSimpleTileStore("localhost:3001/tiles"); // TODO url configurable
    const colorPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 1000);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setIsColorPickerVisible(false);
            }
        }
        if (isColorPickerVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isColorPickerVisible]);

    function onWorldviewChange(newWorldview: Bounds) {
        updateService.setBounds(newWorldview);
        // console.log("onWorldviewChange", newWorldview)
    }

    function onCellHover(coordinate: Coordinate) {
        console.log("onCellHover", coordinate);
    }

    function onCellClick(coordinate: Coordinate) {
        console.log("onCellClick", coordinate);
    }

    function onColorSelect(color: string) {
        console.log("onColorSelect", color);
    }

    function onZoomChange(newZoom: number) {
        console.log("onZoomChange", newZoom);
        setViewportZoom(newZoom);
    }

    function toggleColorPicker() {
        setIsColorPickerVisible(prevState => !prevState);
    }

    function toggleProposalList() {
        setIsProposalListVisible(prevState => !prevState);
    }

    // TODO "slide up" the bottom as the zoom level increases
    const zoombasedAdjustment = useMemo(() => {
        if (viewportZoom > 3000) {
            return '1rem';
        }
        return '-100%';
    }, [viewportZoom]);

    return (
        <div className='bg-bg-primary min-h-screen flex flex-col'>
            <MenuBar />

            <div className={styles.main}>
                <Viewport
                    tileStore={tileStore}
                    pixelStore={pixelStore}
                    zoom={viewportZoom}
                    center={center}
                    onWorldviewChange={onWorldviewChange}
                    onCenterChange={onCenterChange}
                    onZoomChange={onZoomChange}
                    onCellClick={onCellClick}
                    onCellHover={onCellHover}
                />
            </div>

            <div ref={colorPickerRef} className={styles.colorpicker} style={{ bottom: zoombasedAdjustment, display: isColorPickerVisible ? 'flex' : 'none' }}>
                <SimpleColorPicker onColorSelect={onColorSelect} />
            </div>

            {/* {isProposalListVisible && (
                <div className={styles.proposalListContainer}>
                    <ProposalListForMain headerHeight={64} />
                </div>
            )} */}

            <div className={styles.proposalListContainer}>
                <div className={`flex items-center justify-between mb-4`}>
                    <div className='text-white text-xl font-bold'>
                        Proposals
                    </div>
                    <button className={`ml-auto text-white ${isProposalListVisible ? 'rotate-180' : ''} transition duration-300`} onClick={toggleProposalList}>
                        <FaArrowDown />
                    </button>
                </div>
                {isProposalListVisible && (
                    <div className='mb-4'>
                        <div className=''>
                            <ProposalListForMain headerHeight={64} />
                        </div>
                        <div className='pt-4'>
                            <NewProposalPopupForMain />
                        </div>
                    </div>
                )}
            </div>

            {/* {isProposalListVisible ? (
                <div className="flex items-center space-x-2">
                    <span>Proposals</span>
                    <FaArrowUp />
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <span>Proposals</span>
                    <FaArrowDown />
                </div>
            )} */}

            {/* <div className={styles.apps} style={{right: zoombasedAdjustment}}>
                <Apps/>
            </div> */}

            <div className={styles.buttonContainer}>
                <button className={styles.placePixelButton} onClick={toggleColorPicker} style={{ display: isColorPickerVisible ? 'none' : 'flex' }}>
                    Place a Pixel
                </button>
                {/* <Link to="/governance" className={styles.governPixelsButton} onClick={toggleColorPicker} style={{ display: isColorPickerVisible ? 'none' : 'flex' }}>
                    Govern Pixels
                </Link> */}
            </div>

        </div>
    )
}

function onCenterChange(_newCenter: number[]) {
    // console.log("onCenterChange", _newCenter)
}

export default App;
