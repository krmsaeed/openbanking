# Design System - Box & Typography Components

## Box Component

A flexible container component with built-in styling variants, sizes, and utilities.

### Usage

```tsx
import { Box } from "@/components/ui";

// Basic usage
<Box>Content here</Box>

// With variants
<Box variant="primary" size="lg" radius="xl" shadow="md" border>
  Primary box with large padding, rounded corners, shadow and border
</Box>

// As different HTML elements
<Box as="section" variant="success">
  This renders as a <section> element
</Box>
```

### Props

| Prop      | Type                                                                                   | Default     | Description            |
| --------- | -------------------------------------------------------------------------------------- | ----------- | ---------------------- |
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` | Color theme of the box |
| `size`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                 | `'md'`      | Padding size           |
| `radius`  | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'`                                     | `'md'`      | Border radius          |
| `shadow`  | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                               | `'none'`    | Box shadow             |
| `border`  | `boolean`                                                                              | `false`     | Whether to show border |
| `as`      | `ElementType`                                                                          | `'div'`     | HTML element to render |

### Examples

```tsx
// Alert boxes
<Box variant="error" size="md" radius="lg" border>
  <Typography variant="h6" color="error">خطا!</Typography>
  <Typography variant="body2">پیام خطا اینجا نمایش داده می‌شود</Typography>
</Box>

<Box variant="success" size="md" radius="lg" border>
  <Typography variant="h6" color="success">موفق!</Typography>
  <Typography variant="body2">عملیات با موفقیت انجام شد</Typography>
</Box>

// Card-like containers
<Box variant="default" size="lg" radius="xl" shadow="md" border>
  <Typography variant="h4">عنوان کارت</Typography>
  <Typography variant="body1">محتوای کارت اینجا قرار می‌گیرد</Typography>
</Box>

// Semantic HTML elements
<Box as="header" variant="primary" size="lg">
  <Typography variant="h1">سرصفحه سایت</Typography>
</Box>

<Box as="footer" variant="secondary" size="md">
  <Typography variant="body2">فوتر سایت</Typography>
</Box>
```

## Typography Component

A comprehensive text component with built-in typography styles, weights, colors, and utilities.

### Usage

```tsx
import { Typography } from "@/components/ui";

// Basic usage
<Typography>Default body text</Typography>

// With variants
<Typography variant="h1" weight="bold" color="primary" align="center">
  Main Heading
</Typography>

// As different HTML elements
<Typography variant="body1" as="span" color="muted">
  This renders as a span element
</Typography>
```

### Props

| Prop       | Type                                                                                                                                      | Default       | Description                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------- |
| `variant`  | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'body1' \| 'body2' \| 'subtitle1' \| 'subtitle2' \| 'caption' \| 'overline' \| 'button'` | `'body1'`     | Typography style variant    |
| `weight`   | `'thin' \| 'light' \| 'normal' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold' \| 'black'`                                             | `'normal'`    | Font weight                 |
| `align`    | `'left' \| 'center' \| 'right' \| 'justify'`                                                                                              | `'left'`      | Text alignment              |
| `color`    | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'muted' \| 'disabled'`                           | `'default'`   | Text color                  |
| `as`       | `ElementType`                                                                                                                             | Auto-detected | HTML element to render      |
| `truncate` | `boolean`                                                                                                                                 | `false`       | Truncate text with ellipsis |
| `noWrap`   | `boolean`                                                                                                                                 | `false`       | Prevent text wrapping       |

### Examples

```tsx
// Headings
<Typography variant="h1">عنوان اصلی</Typography>
<Typography variant="h2" color="primary">عنوان دوم</Typography>
<Typography variant="h3" weight="semibold">عنوان سوم</Typography>

// Body text
<Typography variant="body1">
  این یک متن بدنه با اندازه استانداد است که برای محتوای اصلی صفحه استفاده می‌شود.
</Typography>

<Typography variant="body2" color="muted">
  این متن کوچک‌تر و با رنگ کم‌رنگ‌تر برای توضیحات اضافی استفاده می‌شود.
</Typography>

// Subtitles
<Typography variant="subtitle1" weight="medium">
  زیرعنوان اصلی
</Typography>

<Typography variant="subtitle2" color="secondary">
  زیرعنوان فرعی
</Typography>

// Special variants
<Typography variant="caption" color="muted">
  متن توضیحی کوچک
</Typography>

<Typography variant="overline" color="primary">
  متن بالای سر
</Typography>

<Typography variant="button" weight="medium">
  متن دکمه
</Typography>

// Text utilities
<Typography variant="body1" truncate style={{ width: '200px' }}>
  این متن طولانی است و باید برش داده شود
</Typography>

<Typography variant="body1" noWrap>
  این متن شکسته نمی‌شود
</Typography>

// Different alignments
<Typography variant="h3" align="center">متن وسط‌چین</Typography>
<Typography variant="body1" align="right">متن راست‌چین</Typography>
<Typography variant="body1" align="justify">
  این متن به صورت تراز شده نمایش داده می‌شود و فاصله‌های بین کلمات تنظیم می‌شود.
</Typography>

// Color variants
<Typography variant="body1" color="success">متن موفقیت</Typography>
<Typography variant="body1" color="error">متن خطا</Typography>
<Typography variant="body1" color="warning">متن هشدار</Typography>
<Typography variant="body1" color="info">متن اطلاعات</Typography>
<Typography variant="body1" color="disabled">متن غیرفعال</Typography>
```

## Combined Usage

```tsx
// Page layout example
<Box as="main" variant="default" size="xl" radius="lg" shadow="sm" border>
  <Box variant="primary" size="md" radius="md" border>
    <Typography variant="h2" color="primary" align="center">
      صفحه ورود
    </Typography>
    <Typography variant="subtitle1" color="secondary" align="center">
      لطفاً اطلاعات خود را وارد کنید
    </Typography>
  </Box>

  <Box variant="default" size="lg">
    <Typography variant="h4" weight="semibold">
      فرم ورود
    </Typography>
    <Typography variant="body1" color="muted">
      تمام فیلدها الزامی هستند
    </Typography>
  </Box>

  <Box variant="success" size="sm" radius="md" border>
    <Typography variant="caption" color="success">
      ورود با موفقیت انجام شد
    </Typography>
  </Box>
</Box>
```

## Persian/RTL Support

Both components work seamlessly with Persian text and RTL layouts:

```tsx
<Box variant="primary" size="lg" radius="xl">
  <Typography variant="h2" align="right">
    سیستم طراحی فارسی
  </Typography>
  <Typography variant="body1" align="right">
    این کامپوننت‌ها برای استفاده با متن فارسی و راست‌چین طراحی شده‌اند.
  </Typography>
</Box>
```
