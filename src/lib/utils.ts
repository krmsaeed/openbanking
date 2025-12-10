/**
 * DEPRECATED: This file is kept for backward compatibility only
 * Please import directly from specific modules:
 *
 * import { convertPersianToEnglish } from '@/lib/utils/string-utils'
 * import { toPersianDate } from '@/lib/utils/date-utils'
 * import { setCookie, getCookie } from '@/lib/utils/cookie-utils'
 * import { isValidNationalId } from '@/lib/utils/validation-utils'
 * import { cn } from '@/lib/utils/common'
 *
 * Or use the index export for all utilities:
 * import { convertPersianToEnglish, toPersianDate, cn } from '@/lib/utils'
 */

// Re-export everything for backward compatibility
export { default, cn } from './utils/common';
export {
    convertPersianToEnglish,
    formatNumberWithCommas,
    cleanNationalId,
} from './utils/string-utils';
export { toPersianDate } from './utils/date-utils';
export {
    setCookie,
    getCookie,
    removeCookie,
    saveUserStateToCookie,
    getUserStateFromCookie,
    clearUserStateCookies,
} from './utils/cookie-utils';
export { isValidNationalId } from './utils/validation-utils';
