# Build an Image Search App with Koyeb, AWS Rekognition, and Algolia

This repository contains the resources to deploy an image search app using the Koyeb serverless platform.

You can check out the complete documentation to run this example **[here](//koyeb.com/tutorials/image-search-app-with-koyeb-aws-rekognition-and-algolia)**.

## Getting Started

### Deploy the procession function to detect labels and index labels on Koyeb

This GitHub repository contains:

- A `koyeb.yaml` file: used to configure and deploy the function `image-search.js` on Koyeb. The `koyeb.yaml` file contains environment variables required by the function to run properly, the Koyeb Store the function must access to retrieve and process the image, and the event triggering the function.

- A `image-search.js` file: The function to detect image labels and index them on Algolia. This function is triggered each time a new image is uploaded to the Koyeb Store.

1. Log-in to the Koyeb Control Panel
2. Create a Store
3. Create secrets name with the associated value: ` aws-reko-access-key`, ` aws-reko-secret-key`, `algolia-app-id`, `algolia-api-key`, `algolia-index`.
4. Edit the `koyeb.yaml` file and replace the `REPLACE_ME_WITH_YOUR_KOYEB_STORE_NAME` value with your Koyeb Store name.

```yaml
functions:
  - name: image-search
    runtime: nodejs14
    handler: koyeb-functions/image-search.handler
    env:
      AWS_ACCESS_KEY:
        value_from_secret:  aws-reko-access-key
      AWS_SECRET_KEY:
        value_from_secret:  aws-reko-secret-key
      ALGOLIA_APP_ID:
        value_from_secret: algolia-app-id
      ALGOLIA_API_KEY:
        value_from_secret: algolia-api-key
      ALGOLIA_INDEX:
        value_from_secret: algolia-index
    volumes:
      - store: REPLACE_ME_WITH_YOUR_KOYEB_STORE_NAME
    events:
      - cloudevent:
          expression: |
            event.source == "koyeb.com/gateway" &&
            event.subject == "REPLACE_ME_WITH_YOUR_KOYEB_STORE_NAME" &&
            event.type.matches("s3:ObjectCreated:.*") &&
            data.object.key.matches("([^\\s]+(\\.(?i)(jpe?g|png))$)")
```
5. Fork this repository
6. Create a new Koyeb Stack using GitHub and select the repository your just forked.

The processing function is deploying on Koyeb and will be ready in a few seconds.


### Run the Next.js app

To run this application you need to:

1. Generate [Koyeb S3 credentials](https://www.koyeb.com/docs/stores/quickstart/manage-store-credentials)
2. In the repository you previously forked, copy the `env.example` to `.env.local`, and edit the variable values with your own:

```
NEXT_PUBLIC_ALGOLIA_APP_ID=REPLACE_ME
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=REPLACE_ME
NEXT_PUBLIC_ALGOLIA_INDEX=REPLACE_ME
KOYEB_S3_ACCESS_KEY=REPLACE_ME
KOYEB_S3_SECRET_KEY=REPLACE_ME
KOYEB_STORE=REPLACE_ME
```
3. Run the app

- `yarn install` to install the project dependencies
- `yarn start` to start the application
