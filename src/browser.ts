import bridge, {ExtendedWindow} from './index';

const wnd = window as ExtendedWindow;

wnd.vkBridge = wnd.vkConnect = bridge;
