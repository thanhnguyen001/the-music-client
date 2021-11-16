import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Playlist from './Pages/PlaylistPage/Playlist';
import Top100Page from './Pages/Top100VnPage/Top100Page';
import Types from './Pages/TypesPage/Types';
import Home from './Pages/Home/Home';
import NotFoundPage from './Pages/NotFoundPage/NotFoundPage';
import ArtistPage from './Pages/ArtistPage/ArtistPage';
import NewSongPage from './Pages/NewSongPage/NewSongPage';
import SearchPage from './Pages/SearchPage/SearchPage';
import MyPage from './Pages/MyPage/MyPage';
import MyPlaylist from './Pages/MyPage/MyPlaylist';

const routeList = [
    {
        path: '/',
        exact: true,
        component: ({ match }) => <Home match={match} />
    },
    {
        path: `/my-music`,
        exact: false,
        component: ({ match }) => <MyPage match={match} />
    },
    {
        path: `/my-playlist/:id`,
        exact: false,
        component: ({ match }) => <MyPlaylist match={match} />
    },
    {
        path: `/nhac-moi`,
        exact: false,
        component: ({ match }) => <NewSongPage match={match} />
    },
    {
        path: `/tim-kiem/:slug`,
        exact: false,
        component: ({ match }) => <SearchPage match={match} />
    },
    {
        path: `/nghe-si/:artist`,
        exact: false,
        component: ({ match }) => <ArtistPage match={match} />
    },
    {
        path: `/album/:albumName/:id`,
        exact: false,
        component: ({ match }) => <Playlist match={match} />
    },
    {
        path: `/playlist/:albumName/:id`,
        exact: false,
        component: ({ match }) => <Playlist match={match} />
    },
    {
        path: '/top100',
        exact: false,
        component: ({ match }) => <Top100Page match={match} />
    },
    {
        path: `/genres`,
        exact: false,
        component: ({ match }) => <Types match={match} />
    },
    {
        path: `/video-clip/:name:id`,
        exact: false,
        component: ({ match }) => <Home match={match} />
    },
    {
        path: `*`,
        exact: true,
        component: () => <NotFoundPage />
    },

]

function routes(props) {

    const renderRoutes = (routeList) => {

        return routeList.map((route, index) =>
            <Route key={index} path={`${route.path}`} exact={route.exact}>
                {route.component}
            </Route>
        )
    }

    return (
        <Switch>
            {renderRoutes(routeList)}
        </Switch>
    );
}

export default routes;