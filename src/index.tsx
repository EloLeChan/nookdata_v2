
import { CssBaseline, List, ListItem, ListItemIcon, ListItemText, ThemeProvider, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { EmojiNature } from '@material-ui/icons';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { homepage } from '../package.json';
import AppBar from './components/AppBar';
import NavigationDrawer from './components/NavigationDrawer';
import './i18n';
import './index.scss';
import { Dict } from './misc';
import Critterpedia from './pages/critterpedia';
import getTheme from './themes';
import UserSettings from './user_settings';

const baseUrl = process.env.NODE_ENV === 'production' ? homepage : 'http://localhost:3000/nookdata_v2';

interface PageData {
    title: string;
    icon: React.ReactNode;
}
const pageData: Dict<PageData> = {
    '/critterpedia': {
        title: 'Critterpedia',
        icon: <EmojiNature />,
    }
}


interface DrawerAdjustProps {
    active: boolean,
    children: React.ReactNode;
}
function DrawerAdjust(props: DrawerAdjustProps) {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('sm'));
    return (
        <div style={{ paddingLeft: 240 * (+props.active) * (+matches), transition: 'padding-left 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms' }}>
            {props.children}
        </div>
    )
}
interface AppFrameProps {
    setTheme: (value: "dark" | "light") => void;
    theme: "dark" | "light";
    setPage: (value: string) => void;
    page: string;
    children: React.ReactNode;
}
function AppFrame(props: AppFrameProps) {
    const theme = useTheme();
    const startOpen = useMediaQuery(theme.breakpoints.up('lg'));
    const [initialRender, setInitialRender] = React.useState(true);
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    if (startOpen && initialRender) {
        setDrawerOpen(true);
        setInitialRender(false);
    }
    return (
        <>
            <AppBar setTheme={props.setTheme} setDrawerOpen={setDrawerOpen} theme={props.theme} drawerOpen={drawerOpen} title={
                <Typography variant="h6">
                    <div
                        style={{
                            color: theme.palette.winter.main,
                            display: 'inline'
                        }}>Nook</div>
                    <div
                        style={{
                            color: theme.palette.summer.main,
                            display: 'inline'
                        }}>Data</div>
                </Typography>
            } />
            <NavigationDrawer open={drawerOpen} setOpen={setDrawerOpen}>
                <List>
                    {Object.entries(pageData).map(([route, data]) => (
                        <ListItem selected={props.page === route} button onClick={() => props.setPage(route)}>
                            <ListItemIcon>{data.icon}</ListItemIcon>
                            <ListItemText primary={data.title} />
                        </ListItem>
                    ))}
                </List>
            </NavigationDrawer>
            <DrawerAdjust active={drawerOpen}>
                {props.children}
            </DrawerAdjust>
        </>
    )
}

interface RouteProps {
    page: string;
    route: string;
    children: React.ReactNode;
}
function Route(props: RouteProps) {
    if (props.page !== props.route) {
        return null;
    }
    document.title = pageData[props.route].title + ' | NookData';
    return <>
        {props.children}
    </>;
}

let timeUpdateId: number | undefined = undefined;
const sentinelDate = new Date();

function App() {
    const themeSetting: "dark" | "light" = window.localStorage.theme || 'dark';
    const [chosenTheme, setChosenThemeImpl] = React.useState<'dark' | 'light'>(themeSetting);
    function setChosenTheme(value: 'dark' | 'light') {
        document.body.classList.add("no-transition");
        setTimeout(() => setChosenThemeImpl(value), 10);
        setTimeout(() => document.body.classList.remove("no-transition"), 20);
    }
    const hemisphereSetting: "north" | "south" = window.localStorage.hemisphere || 'north';
    const [chosenHemisphere, setChosenHemisphere] = React.useState<'north' | 'south'>(hemisphereSetting);
    const settings: UserSettings = {
        theme: chosenTheme,
        hemisphere: chosenHemisphere,
        islandName: 'Gloverboia',
        playerName: 'Starwort',
        timeOffset: 0,
        useSystemTime: true,
        useTwelveHourTime: true,
    }
    const [time, setTime] = React.useState(sentinelDate);
    if (timeUpdateId) {
        window.clearInterval(timeUpdateId);
    }
    timeUpdateId = window.setInterval(() => setTime(new Date()), 500);
    const [page, setPageImpl] = React.useState('/');
    function setPage(route: string) {
        window.history.pushState(null, pageData[route].title, baseUrl + route);
        setPageImpl(route);
    }
    let route = window.location.href.slice(baseUrl.length);
    if (route !== page) {
        setPageImpl(route);
    }
    const theme = React.useMemo(
        () => getTheme(chosenTheme),
        [chosenTheme]
    );
    return <Suspense fallback="Please wait...">
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppFrame page={page} theme={chosenTheme} setTheme={setChosenTheme} setPage={setPage}>
                <Route page={page} route="/critterpedia">
                    <Critterpedia time={time} settings={settings} />
                </Route>
            </AppFrame>
        </ThemeProvider>
    </Suspense>
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
export { };
