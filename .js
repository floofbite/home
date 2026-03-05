import { createManagementApi } from '@logto/api/management';

const logtoEndpoint = process.env.LOGTO_ENDPOINT; // Replace with your Logto endpoint
const clientId = process.env.LOGTO_M2M_CLIENT_ID;
const clientSecret = process.env.LOGTO_M2M_CLIENT_SECRET;

const { apiClient, clientCredentials } = createManagementApi('default', {
    clientId: clientId,
    clientSecret: clientSecret,
    baseUrl: logtoEndpoint,
    apiIndicator: 'https://default.logto.app/api',
});

const accountApiStatus = await apiClient.GET('/api/account-center');
console.log(accountApiStatus.data);

const accessToken = await clientCredentials.getAccessToken();
console.log(accessToken);

const enableAccountAPIResponse = await fetch(
    `${process.env.LOGTO_ENDPOINT}/api/account-center`,
    {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken.value}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            enabled: true,
            fields: {
                name: "Edit",
                avatar: "Edit",
                profile: "Edit",
                email: "Edit",
                phone: "Edit",
                password: "Edit",
                username: "Edit",
                "application/json": JSON.stringify({
                    enabled: true,
                    fields: {
                        name: "Edit",
                        avatar: "Edit",
                        profile: "Edit",
                        email: "Edit",
                        phone: "Edit",
                        password: "Edit",
                        username: "Edit",
                        social: "Edit",
                        customData: "Edit",
                        mfa: "Edit",
                    },
                    webauthnRelatedOrigins: ["*"]
                })
            }
        }),
    }

);
console.log(await enableAccountAPIResponse.json());