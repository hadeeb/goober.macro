import { glob as _glob } from "goober";
import { css as _css } from "goober";

/*#__PURE__*/
_css`color:red;padding:2px 4px;`;

/*#__PURE__*/
_css(`color:red;padding:2px 4px;`);

_glob`color:red;padding:2px 4px;`;

_glob(`color:red;padding:2px 4px;`);
