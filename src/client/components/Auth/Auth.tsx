import { withStore } from 'justorm/react';
import { Form, SubmitButtons } from '@foreverido/uilib';

import S from './Auth.styl';

const initialValues = {
  id: '',
  password: '',
};

export default withStore({ user: [] })(function Auth({ store: { user } }) {
  return (
    <Form
      className={S.root}
      initialValues={{ ...initialValues }}
      validationSchema={{
        id: { type: 'string', empty: false },
        password: { type: 'string', empty: false },
      }}
    >
      {({ Field, isValid, values }) => (
        <>
          <div className={S.fields}>
            <Field name="id" label="Username" />
            <Field name="password" label="Password" type="password" />
          </div>
          <SubmitButtons
            buttons={[
              {
                children: 'Log in',
                onClick: () => user.login(values),
                disabled: !isValid,
              },
              {
                children: 'Register',
                onClick: () => user.register(values),
                disabled: !isValid,
              },
            ]}
          />
        </>
      )}
    </Form>
  );
});
