import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './AppNew';
import '@backstage/ui/css/styles.css';

const rootEl = document.getElementById('root')!;
ReactDOM.createRoot(rootEl).render(App);