import { styled } from "../../macro";

styled.span`
  color: ${props => props.color};
`;

styled("span")`
  color: ${props => props.color};
`;

styled(Comp)`
  color: ${props => props.color};
`;
