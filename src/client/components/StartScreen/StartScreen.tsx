import { useCallback, useState } from 'react';
import { withStore } from 'justorm/react';
import cn from 'classnames';
import { Button, Container, Spinner, Lazy } from '@foreverido/uilib';

import game from '../../game';

import S from './StartScreen.styl';

export default withStore({
  user: ['isLoading', 'data'],
})(function StartScreen({ store: { user } }) {
  const [isStarted, setIsStarted] = useState(false);
  const onEnterClick = useCallback(() => {
    game.start();
    setIsStarted(true);
  }, []);

  const renderContent = useCallback(() => {
    if (user.isLoading) return <Spinner size="l" />;
    if (user.data) return <Button onClick={onEnterClick}>Enter</Button>;
    // @ts-ignore
    return <Lazy loader={() => import('components/Auth/Auth')} />;
  }, [user.isLoading, user.data]);

  return (
    // @ts-ignore
    <Container
      alignItemsCenter
      justifyContentCenter
      className={cn(S.root, isStarted && S.isStarted)}
    >
      {renderContent()}
    </Container>
  );
});
