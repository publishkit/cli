// @ts-ignore
import Clibox from "cli-box";

export const banner = (pklib: ObjectAny) => {
  const { env, version, kitrc } = pklib;
  const b = ` PublishKit @ ${version}
  --------------------------------------------
  ▸ type            : ${env.type}
  ▸ site.name       : ${kitrc.site?.name}
  ▸ site.id         : ${kitrc.site?.id||''}`;
  box(b);
};

export const box = (
  text: string = "foobar",
  size: string = "0x0",
  hAlign = "left"
) => {
  const [w, h] = size.split("x");
  const myBox = new Clibox(
    {
      h,
      w,
      stringify: false,
      marks: {
        nw: "╭",
        n: "─",
        ne: "╮",
        e: "│",
        se: "╯",
        s: "─",
        sw: "╰",
        w: "│",
      },
    },
    {
      text,
      hAlign,
      stretch: true,
    }
  );
  console.log(myBox.stringify());
};
