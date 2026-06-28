# Gumroad Draft Creation

This folder contains the Gumroad CLI setup for creating a draft Full Balance product.

The product is configured as:

- price: `0`
- type: `digital`
- promise: free forever
- cover: `assets/gumroad/gumroad-cover-1280x720-en.png`
- thumbnail: `assets/gumroad/gumroad-thumbnail-600-en.png`
- downloadable file: `gumroad/full-balance-access.html`

## Dry Run

```bash
output/marketing-kit/gumroad/create-full-balance-product.sh
```

## Create Real Draft

Authenticate first:

```bash
export GUMROAD_ACCESS_TOKEN="YOUR_TOKEN"
```

or:

```bash
printf '%s' 'YOUR_TOKEN' | gumroad auth login --with-token
```

Then create the draft product:

```bash
output/marketing-kit/gumroad/create-full-balance-product.sh --execute
```

The script creates a draft product. It does not publish the product.

If the `gumroad` binary is not on your `PATH`, set `GUMROAD_BIN`:

```bash
GUMROAD_BIN=/path/to/gumroad output/marketing-kit/gumroad/create-full-balance-product.sh --execute
```
