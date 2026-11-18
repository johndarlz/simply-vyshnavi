# Vyshnavi Collections Hub

Build a Complete E-Commerce Website: Vyshnavi Collections

Build a modern, premium-looking but extremely simple e-commerce website called “Vyshnavi Collections”.

The business sells physical products online. The website should be easy enough for any customer to browse products and place an order without confusion.

The goal is NOT to build a complicated Amazon/Flipkart-style platform.

The goal is:

Beautiful product images → simple product browsing → product details → choose Website Order or WhatsApp Order → easy payment → order management.

1. BRAND

Business name:

Vyshnavi Collections

Tagline:

Simple. Elegant. Yours.

Create a premium feminine fashion/lifestyle-store visual identity.

Design should feel:

Premium

Elegant

Clean

Minimal

Trustworthy

Modern

Mobile-first

Fast

Easy to use

Avoid:

Excessive animations

Complicated menus

Too many pages

Crowded layouts

Unnecessary popups

Complicated customer accounts

2. TARGET USERS

The primary users will be customers shopping from mobile phones.

Therefore:

Mobile-first design is extremely important.

The website must work beautifully on:

Mobile

Tablet

Desktop

Most customers should be able to place an order in less than 2–3 minutes.

3. TECHNOLOGY

Build this as a production-ready full-stack web application.

Recommended stack:

Frontend:

Next.js

React

TypeScript

Tailwind CSS

Backend:

Next.js API routes/server actions

Database:

Supabase PostgreSQL

Authentication:

Supabase Auth for admin

Storage:

Supabase Storage for product images/videos

Payments:

Use a proper Indian payment gateway such as Razorpay for online UPI/card/net-banking payments.

WhatsApp:

WhatsApp click-to-chat using the store's configured WhatsApp business number.

Deployment:

Vercel

The architecture should make it easy to change the payment gateway, WhatsApp number, store information, shipping charges and other settings from the admin panel.

4. WEBSITE STRUCTURE

Create these main pages:

Home

All Products

Product Details

Checkout

Order Success

Track Order

Admin Login

Admin Dashboard

Admin Products

Admin Orders

Admin Settings

Optional basic pages:

About

Contact

Privacy Policy

Terms & Conditions

Shipping Policy

Return/Refund Policy

5. HOME PAGE

Create a very clean premium homepage.

Header:

Left:

Vyshnavi Collections

Center/right navigation:

Home

Collections

Contact

Right side:

Search icon

Cart icon

On mobile use a clean hamburger menu.

Hero Section

Large premium visual area.

Text:

Vyshnavi Collections

Discover something beautiful.

Short description:

“Explore our latest collection of carefully selected products, made for everyday elegance.”

Buttons:

Shop Now

Explore Collections

Use a large image or promotional banner that can be changed from the admin panel.

6. FEATURED PRODUCTS

Show:

Featured Collection

Display products in a clean grid.

Desktop:

4 products per row.

Tablet:

3 products per row.

Mobile:

2 products per row.

Each product card should contain:

Product image

Product name

Price

Original price if applicable

Discount percentage

Small badge such as NEW / SALE / BESTSELLER

Quick View

Example:

Product Name

₹799

₹999

20% OFF

Do not overcrowd product cards.

7. ALL PRODUCTS PAGE

Create a dedicated:

All Collections

page.

Display every active product.

At the top:

Search bar

Category filter

Sort:

Newest

Price: Low to High

Price: High to Low

Popular

Product grid.

Each product card should be clickable.

Clicking the card opens the product details page.

8. PRODUCT DETAILS PAGE

This is one of the most important pages.

When the customer opens a product:

Display a large image gallery.

Allow:

Multiple product images

Product video

Swipe on mobile

Zoom image

Full-screen image viewer

Below media:

Product name

Rating/reviews if enabled

Price

Original price

Discount

Stock status

Product description

PRODUCT INFORMATION

Show information such as:

Product name

Price

Description

Category

Available colors

Available sizes

Material

Dimensions

Weight

Care instructions

Delivery information

Only display fields that are available for that product.

Do not show empty fields.

9. PRODUCT VARIANTS

Admin should be able to create variants.

Examples:

Color:

Red

Pink

Black

Size:

S

M

L

XL

Each variant should optionally have:

Separate stock quantity

SKU

Additional price

Variant image

Customer must select required variants before ordering.

10. TWO ORDER OPTIONS

Every product page must clearly show TWO primary ordering methods.

OPTION 1 — ORDER FROM WEBSITE

Button:

Order Now

or

Buy Now

This opens the checkout/order process.

OPTION 2 — ORDER THROUGH WHATSAPP

Button:

Order on WhatsApp

When clicked, automatically open WhatsApp with a pre-filled message.

Example:

“Hello Vyshnavi Collections 👋

I want to order this product:

Product: Pink Designer Kurti

Product ID: VC102

Price: ₹799

Quantity: 1

Product link:

https://website.com/products/pink-designer-kurti

Please confirm availability and order details.”

The customer can then send the message.

The WhatsApp number must be configurable from Admin Settings.

11. CART

Create a simple shopping cart.

Cart should show:

Product image

Product name

Selected variant

Quantity

Price

Subtotal

Remove button

Allow quantity:

/ -

Show:

Subtotal

Shipping

COD charge if applicable

Discount

Total

Button:

Proceed to Checkout

Do NOT force customers to create an account.

12. CHECKOUT

Make checkout extremely simple.

Customer fields:

Required:

Full Name

Mobile Number

WhatsApp Number (optional if same as mobile)

Address

City

State

Pincode

Optional:

Landmark

Email

If WhatsApp number is same as mobile, provide:

☑ WhatsApp number same as mobile

13. SHIPPING

Admin should be able to configure shipping.

Settings:

Free shipping above:

₹__

Standard shipping:

₹__

The shipping amount must be configurable from Admin.

Example:

Subtotal: ₹799

Shipping: ₹50

Total: ₹849

14. PAYMENT METHODS

Provide two payment methods.

ONLINE PAYMENT

Button:

Pay Online

Use Razorpay or another reliable Indian payment gateway.

Support:

UPI

Credit Card

Debit Card

Net Banking

Wallets where supported

The payment gateway should handle payment securely.

Never store card information on the website.

After successful payment:

Create the order.

Set payment status:

Paid

15. CASH ON DELIVERY

Provide:

Cash on Delivery

The COD charge must NOT be hardcoded.

Admin should be able to configure the COD charge.

Example:

Product A:

COD charge = ₹30

Product B:

COD charge = ₹50

Product C:

COD charge = ₹20

Therefore, each product should have a field:

COD Extra Charge

Example:

COD Extra Charge:

₹40

If the customer chooses COD:

Order total becomes:

Product price

+

Shipping

+

COD charge

Discount

Example:

Product = ₹799

Shipping = ₹50

COD = ₹40

Total = ₹889

Show clearly:

COD handling charge: ₹40

16. IMPORTANT COD LOGIC

The COD fee must be configurable when adding/editing the product.

Admin product form:

Product Name

Product Price

Discount

Stock

Category

COD Extra Charge

Images

Video

Description

Variants

SKU

Default:

COD Extra Charge = ₹0

Admin can set:

₹20

₹30

₹40

₹50

etc.

17. ORDER CONFIRMATION

After successful order:

Show:

Order Placed Successfully 🎉

Example:

Order ID:

#VC202609080001

Message:

“Thank you for shopping with Vyshnavi Collections.”

Show:

Order ID

Product

Quantity

Total

Payment method

Delivery address

Order status

Buttons:

Track Order

Continue Shopping

Also send order confirmation through WhatsApp if possible.

18. ORDER STATUS

Admin can update order status.

Statuses:

Pending

Payment Pending

Confirmed

Processing

Packed

Shipped

Out for Delivery

Delivered

Cancelled

Returned

Refunded

Customer can track order using:

Order ID + Mobile Number

Do not require customer login.

19. TRACK ORDER PAGE

Simple page.

Title:

Track Your Order

Fields:

Order ID

Mobile Number

Button:

Track Order

Display timeline:

✓ Order Placed

✓ Confirmed

✓ Processing

✓ Packed

✓ Shipped

✓ Out for Delivery

✓ Delivered

Highlight the current status.

20. WHATSAPP ORDER SYSTEM

Create a reusable WhatsApp ordering system.

Every product has:

Order on WhatsApp

When clicked:

Generate a WhatsApp message automatically.

Include:

Store name

Product name

Product ID

Variant

Quantity

Price

Product URL

Example:

Hello Vyshnavi Collections 👋

I would like to order:

Product: Floral Printed Kurti

Product ID: VC104

Size: M

Color: Pink

Quantity: 1

Price: ₹899

Product Link:

[website product URL]

Please confirm my order.

The WhatsApp number must be controlled through:

Admin → Settings → WhatsApp Number

21. ADMIN PANEL

Create a very simple admin dashboard.

Admin URL:

/admin

Require secure admin authentication.

Admin should NOT be publicly accessible.

22. ADMIN DASHBOARD

Dashboard cards:

Total Orders

Today's Orders

Pending Orders

Confirmed Orders

Delivered Orders

Total Products

Low Stock Products

Revenue

Today's Revenue

This Month's Revenue

Keep the dashboard simple.

23. PRODUCT MANAGEMENT

Admin page:

Products

Buttons:

Add Product

Search

Filter

Edit

Delete

Activate/Deactivate

Duplicate

24. ADD PRODUCT

Create a very easy product form.

Fields:

Basic Information

Product Name

Product ID / SKU

Category

Description

Pricing

Selling Price

Original Price

Discount

COD Extra Charge

Inventory

Stock Quantity

Low Stock Alert

Product Media

Upload multiple images.

Upload product video.

Set primary image.

Allow drag-and-drop image ordering.

Variants

Enable variants:

☑ Color

☑ Size

Allow variant-specific stock.

Product Settings

☑ Featured Product

☑ New Arrival

☑ Bestseller

☑ Active

☑ Allow Website Orders

☑ Allow WhatsApp Orders

25. PRODUCT IMAGE HANDLING

Images should automatically be optimized.

Use:

WebP/AVIF where appropriate

Responsive images

Lazy loading

CDN/storage URLs

Do not make the website slow because of large product images.

Allow admin to upload high-quality images.

26. PRODUCT VIDEO

Admin should be able to upload a short product video.

Product page should display:

Image → Image → Video → Image

Video should:

Load efficiently

Be muted by default

Have controls

Work on mobile

Not automatically consume excessive bandwidth

27. ADMIN ORDER MANAGEMENT

Admin page:

Orders

Table:

Order ID

Customer

Phone

Items

Amount

Payment

Order Status

Date

Actions

Click order → detailed order page.

28. ORDER DETAIL PAGE

Show:

Customer Information

Name

Phone

WhatsApp

Address

Product Details

Product name

SKU

Variant

Quantity

Price

Payment Information

Payment method

Payment status

Transaction ID if applicable

Order Information

Order date

Order status

Shipping details

Admin notes

29. ADMIN ORDER ACTIONS

Admin should be able to:

Confirm order

Cancel order

Mark processing

Mark packed

Add tracking number

Mark shipped

Mark delivered

Mark returned

Mark refunded

Also provide:

Contact Customer on WhatsApp

Button.

This should open WhatsApp with the customer's number.

30. ADMIN SETTINGS

Create a settings page.

Sections:

Store

Store Name

Vyshnavi Collections

Logo

Store description

Phone

Email

Address

WhatsApp

WhatsApp Business Number

Payment

Razorpay Key ID

Razorpay Secret

Payment mode:

Test / Live

Shipping

Standard Shipping

Free Shipping Threshold

COD

Enable COD

Default COD Charge

Social Media

Instagram

Facebook

YouTube

Website

Favicon

Logo

Hero Banner

Announcement Text

31. ANNOUNCEMENT BAR

At the top of the website, allow admin to configure an announcement.

Examples:

“Free Shipping on Orders Above ₹999”

“New Collection Now Live ✨”

“COD Available Across India”

Admin can enable/disable it.

32. SEARCH

Create a simple search feature.

Search by:

Product name

SKU

Category

Show search results instantly.

Mobile search should be easy to access.

33. CATEGORIES

Admin can create categories.

Example:

New Arrivals

Best Sellers

Kurtis

Sarees

Jewellery

Accessories

Categories must be dynamic.

Admin:

Add Category

Edit Category

Delete Category

Set Category Image

Activate/Deactivate

34. DESIGN SYSTEM

Use a premium minimal design.

Suggested visual direction:

Background:

Warm white / off-white

Text:

Dark charcoal

Accent:

Elegant muted rose / burgundy / gold-inspired accent

Do not use too many colors.

Typography:

Elegant heading font paired with a clean sans-serif body font.

Cards:

Soft rounded corners.

Very subtle shadows.

Lots of whitespace.

Buttons:

Rounded but not overly pill-shaped.

Images:

Large and clean.

35. MOBILE DESIGN

Mobile is the highest priority.

Bottom navigation can contain:

Home

Collections

Search

Cart

Account/Admin should NOT be part of customer navigation.

Product cards should be easy to tap.

Sticky bottom CTA on product page:

Order Now

and

WhatsApp

Make sure buttons do not overlap content.

36. PERFORMANCE

The website should be very fast.

Requirements:

Lazy-load images

Optimize images

Lazy-load videos

Use caching

Minimize JavaScript

Responsive images

SEO-friendly pages

Server-side rendering where useful

Avoid unnecessary animations

Target:

Excellent Lighthouse performance.

37. SEO

Every product should have:

SEO title

SEO description

SEO-friendly URL

Example:

/products/pink-floral-kurti

Generate:

Sitemap

Robots.txt

Product structured data

Open Graph metadata

Product pages should be shareable on WhatsApp/Instagram/Facebook.

38. SOCIAL SHARING

Product page should have:

Share Product

Options:

WhatsApp

Copy Link

Other native sharing options where supported.

WhatsApp sharing should automatically include product name and link.

39. SECURITY

Implement:

Secure admin authentication

Protected admin routes

Server-side authorization

Input validation

Rate limiting where appropriate

Secure payment verification

Environment variables for secrets

Never expose payment secrets to frontend

Validate Razorpay/payment webhook signatures

Database access policies

Secure image upload rules

Never trust price/order information sent from the browser.

Always verify product price and stock server-side before creating an order.

40. DATABASE STRUCTURE

Create a clean Supabase database.

Tables:

products

id

name

slug

sku

description

category_id

price

original_price

discount

cod_charge

stock

low_stock_threshold

featured

new_arrival

bestseller

active

allow_website_order

allow_whatsapp_order

created_at

updated_at

product_images

id

product_id

image_url

sort_order

is_primary

product_videos

id

product_id

video_url

thumbnail_url

categories

id

name

slug

image_url

active

created_at

product_variants

id

product_id

type

name

price_adjustment

stock

sku

image_url

orders

id

order_number

customer_name

phone

whatsapp

email

address

city

state

pincode

landmark

subtotal

shipping

cod_charge

discount

total

payment_method

payment_status

order_status

payment_id

tracking_number

admin_notes

created_at

updated_at

order_items

id

order_id

product_id

product_name

sku

variant

quantity

price

admins

id

email

created_at

settings

id

key

value

updated_at

41. ORDER NUMBER

Generate readable order numbers.

Format:

VC + date + sequence

Example:

VC202609080001

VC202609080002

VC202609080003

Do not expose database IDs to customers.

42. PAYMENT FLOW

Website order:

Customer adds product

↓

Checkout

↓

Select:

Online Payment / COD

↓

If Online Payment:

Create payment order server-side

↓

Open payment gateway

↓

Customer pays

↓

Verify payment server-side

↓

Create/confirm order

↓

Show Order Success

If COD:

Calculate:

Product total

+

Shipping

+

COD charge

Discount

↓

Create order

↓

Order status = Pending/Confirmed depending on business configuration

↓

Show Order Success

43. STOCK MANAGEMENT

When an order is successfully created:

Reduce stock.

Prevent customers from ordering unavailable products.

If stock = 0:

Show:

Out of Stock

Disable:

Order Now

Optionally keep:

WhatsApp enquiry

Admin should be able to manually adjust stock.

44. WHATSAPP + WEBSITE ORDER MUST BE SEPARATE

Important:

WhatsApp orders should NOT automatically be treated as paid website orders.

WhatsApp flow:

Customer clicks WhatsApp

↓

WhatsApp opens with product information

↓

Customer sends message

↓

Store owner contacts customer

↓

Store owner manually confirms order/payment

Website order flow:

Customer uses checkout

↓

Payment/COD selected

↓

Order is recorded automatically

Make this distinction clear in the system.

45. CUSTOMER ACCOUNT

Do NOT require customer registration.

Customers can order as guests.

This keeps the website simple.

Only admin requires authentication.

46. EMPTY STATES

Create beautiful empty states.

No products:

“New collections are coming soon ✨”

Empty cart:

“Your cart is waiting for something beautiful.”

No order found:

“We couldn't find an order with those details.”

47. ERROR HANDLING

Show friendly errors.

Never show technical database errors to customers.

Examples:

“Something went wrong. Please try again.”

“Payment could not be completed. Your order has not been confirmed.”

“Product is currently unavailable.”

48. ADMIN UX

The admin interface should be MUCH simpler than the customer website.

Use:

Sidebar:

Dashboard

Products

Categories

Orders

Customers

Settings

Logout

Use simple tables and forms.

The store owner should be able to add a product in under 2 minutes.

49. PRODUCT CREATION EXPERIENCE

Make adding products extremely easy.

Admin clicks:

+ Add Product

Then:

Upload images

Enter product name

Enter price

Enter stock

Enter COD charge

Add description

Select category

Upload optional video

Select Featured/New/Bestseller

Click Publish

Button:

Publish Product

After publishing:

“Product published successfully.”

50. CUSTOMER EXPERIENCE

The ideal customer journey should be:

HOME

↓

PRODUCTS

↓

PRODUCT

↓

Choose variant

↓

Choose:

ORDER NOW

OR

ORDER ON WHATSAPP

Website order:

↓

CHECKOUT

↓

PAYMENT

↓

ORDER SUCCESS

WhatsApp:

↓

WHATSAPP

↓

Customer sends message

↓

Store contacts customer

51. HOMEPAGE SIMPLICITY

Do NOT add unnecessary sections.

Recommended homepage:

Header

Hero

Featured Products

New Arrivals

Shop by Category

Small About section

Why Shop With Us

Instagram/Social section

Footer

That's enough.

52. TRUST SECTION

Add a simple section:

Why Shop With Vyshnavi Collections?

Cards:

✓ Carefully Selected Products

✓ Easy Ordering

✓ Secure Online Payments

✓ COD Available

✓ WhatsApp Support

Keep it visually minimal.

53. FOOTER

Footer:

Vyshnavi Collections

“Simple. Elegant. Yours.”

Links:

Home

Collections

About

Contact

Track Order

Shipping Policy

Return Policy

Privacy Policy

Terms & Conditions

Social icons:

Instagram

Facebook

WhatsApp

Copyright:

© 2026 Vyshnavi Collections. All rights reserved.

54. CONTACT PAGE

Display:

Vyshnavi Collections

Phone

WhatsApp

Email

Business address

Instagram

Button:

Chat on WhatsApp

Button:

Call Us

55. IMPORTANT BUSINESS REQUIREMENT

Everything that may change should be configurable from Admin.

Do NOT hardcode:

Product names

Prices

COD charges

Shipping charges

WhatsApp number

Store phone number

Store email

Categories

Product images

Hero banners

Announcement bar

Payment configuration

Social links

56. RESPONSIVE PRODUCT GRID

Desktop:

4 columns

Tablet:

3 columns

Mobile:

2 columns

Product images should use consistent aspect ratios so the grid looks premium.

57. PRODUCT CARD

Example:

[ PRODUCT IMAGE ]

NEW

Pink Floral Kurti

₹899

₹1,199

25% OFF

[View Product]

Do not put too many buttons inside the card.

Clicking the product card should open the product page.

58. MICRO-INTERACTIONS

Use subtle animations only.

Examples:

Image hover zoom

Button hover

Smooth page transitions

Cart update animation

Toast notifications

Do NOT use excessive animation.

59. TOAST NOTIFICATIONS

Examples:

“Added to cart”

“Product removed”

“Order placed successfully”

“Link copied”

“Product published”

60. ADMIN ANALYTICS

Basic analytics only.

Show:

Total sales

Orders

Average order value

Top products

No need for complicated analytics initially.

61. FUTURE-READY ARCHITECTURE

Build the application so these can be added later:

Customer accounts

Coupons

Reviews

Wishlist

Loyalty program

Inventory reports

Delivery integration

Automated WhatsApp notifications

Email notifications

SMS notifications

GST invoices

Multiple payment gateways

Multiple admins

Advanced analytics

Do NOT implement these now unless required.

Keep version 1 simple.

62. IMPORTANT PAYMENT REQUIREMENT

Use a legitimate payment gateway integration rather than attempting to directly process UPI credentials/payment information.

For Indian customers, prioritize a simple UPI-friendly checkout.

The payment gateway must:

Create payment orders server-side

Verify payments server-side

Handle failed payments

Handle cancelled payments

Support webhook verification

Prevent fake successful-payment requests

63. ADMIN DEMO DATA

When developing, create sample products so the website doesn't look empty.

Example:

Product:

Elegant Floral Kurti

Price:

₹899

Original:

₹1,199

COD:

₹40

Stock:

25

Category:

Kurtis

Use placeholder images only for development.

Make it easy to replace them through Admin.

64. FINAL UI STYLE

The final website should look like a real premium Indian boutique/store.

Think:

Minimal luxury

Clean product photography

Lots of whitespace

Elegant typography

Soft neutral background

Beautiful product cards

Simple navigation

Very clear CTA buttons

Mobile-first shopping

Avoid looking like a generic template.

65. IMPORTANT: DO NOT OVERBUILD

This is a small business.

Do NOT create:

Complicated customer dashboards

Complex subscription systems

Multi-vendor marketplace

Complicated recommendation engines

Unnecessary AI

Complicated loyalty systems

Excessive filters

Complicated checkout

Forced account registration

Focus on:

Products → Order → Payment → WhatsApp → Admin → Orders

66. FINAL ACCEPTANCE CRITERIA

The website is considered complete only when:

✓ Homepage works

✓ Products can be added through Admin

✓ Products can be edited/deleted

✓ Products can be activated/deactivated

✓ Product images can be uploaded

✓ Product videos can be uploaded

✓ Product variants work

✓ Product stock works

✓ COD charge can be set per product

✓ Shipping can be configured

✓ Customers can add products to cart

✓ Customers can checkout as guests

✓ Online payment works through the selected payment gateway

✓ Payment is securely verified

✓ COD works

✓ COD charge is automatically added

✓ WhatsApp ordering generates correct product information

✓ WhatsApp number is configurable

✓ Orders are stored in database

✓ Admin can view orders

✓ Admin can update order status

✓ Customer can track order

✓ Website works on mobile

✓ Website works on desktop

✓ Images are optimized

✓ SEO metadata exists

✓ Admin routes are protected

✓ Payment secrets are never exposed to frontend

✓ No hardcoded business settings

✓ Error handling works

✓ Empty states work

✓ Website looks premium

✓ Website remains simple

67. BUILD ORDER

Build the project in this order:

PHASE 1:

Project setup + database

PHASE 2:

Premium UI + homepage

PHASE 3:

Product listing

PHASE 4:

Product details

PHASE 5:

Cart

PHASE 6:

Checkout

PHASE 7:

Online payment integration

PHASE 8:

COD system

PHASE 9:

WhatsApp ordering

PHASE 10:

Admin authentication

PHASE 11:

Admin dashboard

PHASE 12:

Product management

PHASE 13:

Order management

PHASE 14:

Order tracking

PHASE 15:

Settings

PHASE 16:

SEO + performance + security

PHASE 17:

Mobile testing + final polish

68. DELIVERABLE

Provide a complete working application.

Do not only create a frontend mockup.

The final project must include:

Frontend

Backend

Database

Admin panel

Authentication

Product management

Image upload

Video upload

Cart

Checkout

Online payment integration

COD

WhatsApp ordering

Order management

Order tracking

Settings

Responsive design

Security

SEO

Deployment instructions

Use clean, maintainable, production-ready code.

The final result should feel like a small premium boutique e-commerce store, not a complicated marketplace.

Brand:

VYSHNAVI COLLECTIONS

Tagline:

Simple. Elegant. Yours.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://simply-vyshnavi.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9439aa16-0876-4b89-9206-652cadcca1c4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
