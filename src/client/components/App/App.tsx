import { withStore } from 'justorm/react';
import { Theme, ThemeDefaults } from '@foreverido/uilib';

import 'stores';
import StartScreen from '../StartScreen/StartScreen';
import S from './App.styl';

const colors = { active: '#00ff00' };
// @ts-ignore
const theme = ThemeDefaults.getConfig({ colors });

export default withStore({
  user: ['isLoading', 'data'],
})(function App({ store: { user } }) {
  return (
    <div className={S.root}>
      <Theme config={theme} />
      <StartScreen />
    </div>
  );
});
