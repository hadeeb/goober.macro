import { styled } from "../../macro";

styled.div;
styled.span`
  color: ${props => props.color};
  padding: 2px 4px;
  &:hover {
    padding: 1em;
  }
`;
