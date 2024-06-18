import styles from './App.module.css';
import React, {useEffect, useMemo, useState, useRef} from "react";
import {Bounds, Coordinate} from "@/webtools/types.ts";
import {useSimpleTileStore} from "@/webtools/hooks/SimpleTileStore.ts";
import {useDojoPixelStore} from "@/stores/DojoPixelStore.ts";
import {useUpdateService} from "@/webtools/hooks/UpdateService.ts";
import Viewport from "@/webtools/components/Viewport/ViewPort.tsx";
import SimpleColorPicker from "@/components/ColorPicker/SimpleColorPicker.tsx";
import MenuBar from "@/components/MenuBar/MenuBar.tsx";
import Apps from "@/components/Apps/Apps.tsx";
import {useDojoAppStore} from "@/stores/DojoAppStore.ts";
import {Route, Routes, Link, useLocation} from "react-router-dom";
import Loading from "@/components/Loading/Loading.tsx";
import Settings from "@/components/Settings/Settings.tsx";
import {usePixelawProvider} from "@/providers/PixelawProvider.tsx";
import {useViewStateStore, useSyncedViewStateStore} from "@/stores/ViewStateStore.ts";
import {useDojoInteractHandler} from "@/hooks/useDojoInteractHandler.ts";
import Governance from './pages/Governance';
import NewProposal from './pages/NewProposal';
import ProposalDetails from './pages/ProposalDetails';

function App() {
    //<editor-fold desc="State">


    //</editor-fold>

    //<editor-fold desc="Hooks">
    const updateService = useUpdateService(`ws://localhost:3001/tiles`)  // TODO url configurable
    const pixelStore = useDojoPixelStore();
    const tileStore = useSimpleTileStore("localhost:3001/tiles");   // TODO url configurable
    const appStore = useDojoAppStore();
    const {clientState, error, gameData} = usePixelawProvider();
    const {
        color,
        setColor,
        center,
        setCenter,
        zoom,
        setZoom,
        setHoveredCell,
        setClickedCell
    } = useViewStateStore();

    useDojoInteractHandler(pixelStore, gameData);
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    useSyncedViewStateStore();
    //</editor-fold>

    //<editor-fold desc="Handlers">
    useEffect(() => {
        pixelStore.refresh()
    }, [updateService.tileChanged]);

    const location = useLocation();

    useEffect(() => {
        // Reset color picker visibility on route change
            setIsColorPickerVisible(false);
        }, [location]);

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
        updateService.setBounds(newWorldview)
        pixelStore.prepare(newWorldview)
    }

    function onCellHover(coordinate: Coordinate | undefined) {
        // TODO this is where we'll do some p2p social stuff
        setHoveredCell(coordinate)
    }

    function onCellClick(coordinate: Coordinate) {
        setClickedCell(coordinate)
    }

    function onColorSelect(color: string) {
        // remove the leading #
        color = color.replace('#', '')
        setColor(color)
    }

    function toggleColorPicker() {
        setIsColorPickerVisible(prevState => !prevState);
    }

    //</editor-fold>

    //<editor-fold desc="Custom behavior">

    // TODO "slide up" the bottom as the zoomlevel increases
    const zoombasedAdjustment = useMemo(() => {
        if (zoom > 3000) {
            return '1rem';
        }
        return '-100%';
    }, [zoom]);

    //</editor-fold>

    //<editor-fold desc="Output">
    if (clientState === "loading") {
        document.title = "PixeLAW: Loading";
        return <Loading/>;
    }

    if (clientState === "error") {
        document.title = "PixeLAW: Error";
        const errorMessage = `${error}`
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorMessage}>
                    <h1 className={styles.errorTitle}>
                        Something went wrong
                    </h1>
                    {errorMessage !== '' &&
                        <p className={styles.errorDetail}>
                            {errorMessage}
                        </p>
                    }
                    <p className={styles.errorSuggestion}>
                        Try to refresh this page. If issue still persists, alert the team at Discord.
                    </p>
                </div>
            </div>
        );
    }

    document.title = "PixeLAW: World";

    return (
        <div className={styles.container}>
            <MenuBar/>

            <div className={styles.main}>

                <Routes>
                    <Route path="/settings" element={<Settings/>}/>
                    <Route path="/" element={
                        <>
                            <Viewport
                                tileStore={tileStore}
                                pixelStore={pixelStore}
                                zoom={zoom}
                                setZoom={setZoom}
                                center={center}
                                setCenter={setCenter}
                                onWorldviewChange={onWorldviewChange}
                                onCellClick={onCellClick}
                                onCellHover={onCellHover}
                            />
                            <div ref={colorPickerRef} className={styles.colorpicker} style={{ bottom: zoombasedAdjustment, display: isColorPickerVisible ? 'flex' : 'none' }}>
                                <SimpleColorPicker color={color} onColorSelect={onColorSelect}/>
                            </div>

                            <div className={styles.buttonContainer}>
                                <button className={styles.placePixelButton} onClick={toggleColorPicker} style={{ display: isColorPickerVisible ? 'none' : 'flex' }}>
                                    Place a Pixel
                                </button>
                                <Link to="/governance" className={styles.governPixelsButton} onClick={toggleColorPicker} style={{ display: isColorPickerVisible ? 'none' : 'flex' }}>
                                    Govern Pixels
                                </Link>
                            </div>

                            {/* Disable for p/war */}
                            {/* <div className={styles.apps} style={{left: zoombasedAdjustment}}>
                                <Apps
                                    appStore={appStore}
                                />
                            </div> */}
                        </>
                    }/>

                    <Route path="/governance" element={<Governance />} />
                    <Route path="/new-proposal" element={<NewProposal />} /> 
                    <Route path="/proposal/:id" element={<ProposalDetails />} />

                </Routes>
            </div>
        </div>
    )
    //</editor-fold>
}


export default App
