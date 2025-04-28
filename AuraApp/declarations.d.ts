// this is to fix the JSX errors caused by linear gradients and other UI elements in Index.tsx (app doesnt seem to work without it :/ )
declare module "expo-linear-gradient" {
  import { Component } from "react";
  import { ViewProps } from "react-native";
  interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }
  export default class LinearGradient extends Component<LinearGradientProps> {}
}

declare module "@react-native-masked-view/masked-view" {
  import { Component } from "react";
  import { ViewProps } from "react-native";
  interface MaskedViewProps extends ViewProps {
    maskElement: React.ReactElement;
  }
  export default class MaskedView extends Component<MaskedViewProps> {}
}
