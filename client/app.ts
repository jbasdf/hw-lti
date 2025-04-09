import { ltiLaunch } from '@atomicjolt/lti-client';
import type { LaunchSettings } from '@atomicjolt/lti-client';
import { LTI_NAMES_AND_ROLES_PATH, LTI_SIGN_DEEP_LINK_PATH } from '../definitions';

const launchSettings: LaunchSettings = window.LAUNCH_SETTINGS;
ltiLaunch(launchSettings).then((valid) => {
  if (valid) {
    document.body.innerHTML = `
      <h1>- Hello World -</h1>
    `;

    const jwt = launchSettings.jwt;

    // Deep Linking example
    if (launchSettings.deepLinking) {
      document.body.innerHTML += `
        <h2>Deep Linking</h2>
        <button id="deep-linking-button">Deep Link</button>
        <form id="deep-linking-form" method="post">
          <input id="deep-link-jwt" type="hidden" name="JWT" value="" />
          <button id="deep-link-submit" type="submit" style="display:none;">Submit</button>
        </form>
      `;
      const deepLinkingButton = document.getElementById('deep-linking-button');
      if (deepLinkingButton) {
        deepLinkingButton.addEventListener('click', () => {
          const deepLink = {
            type: 'html',
            html: '<h2>Just saying hi!</h2>',
            title: 'Hello World',
            text: 'A simple hello world example',
          };

          fetch('/' + LTI_SIGN_DEEP_LINK_PATH, {
            method: 'POST',
            body: JSON.stringify([deepLink]),
            headers: {
              'Authorization': `Bearer ${jwt}`,
              'Content-Type': 'application/json'
            }
          })
            .then(response => {
              return response.json();
            })
            .then((d: any) => {
              const data = JSON.parse(d);
              const form = document.getElementById('deep-linking-form') as HTMLFormElement;
              form?.setAttribute('action', launchSettings.deepLinking?.deep_link_return_url || '');
              const field = document.getElementById('deep-link-jwt');
              field?.setAttribute('value', data.jwt);
              form?.submit();
            })
            .catch((error) => {
              console.error('Error:', error);
            });

        });
      }
    }

    // Example of calling the names and roles service
    fetch(`/${LTI_NAMES_AND_ROLES_PATH}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch((error) => {
        console.error('Error:', error);
      });

  } else {
    document.body.innerHTML = 'Failed to launch';
  }
});
