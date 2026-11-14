import { CopyCommand } from "@/components/copy";
import { RegisterMark } from "@/components/register-mark";
import type { FormulaItem } from "@/lib/registry";
import { REGISTER_INFO, isRegister } from "@/lib/registry";
import { installCommand } from "@/lib/site";

const NO_PRIMITIVE = "No UI SDK part";

export const ItemCard = ({ item }: { item: FormulaItem }) => {
  const { Demo } = item;
  const register = isRegister(item.register)
    ? REGISTER_INFO[item.register].title
    : "Every register";
  const builtOn =
    item.primitives.length > 0
      ? item.primitives.map((primitive) => `UI SDK ${primitive}`).join(", ")
      : NO_PRIMITIVE;

  return (
    <article aria-labelledby={`item-${item.name}`} className="card">
      <header className="card-head">
        <h4 className="card-title" id={`item-${item.name}`}>
          {item.title}
        </h4>
        <p className="card-description">{item.description}</p>
        <dl className="card-specs">
          <div>
            <dt>Register</dt>
            <dd>
              <RegisterMark
                register={isRegister(item.register) ? item.register : "other"}
              />
              {register}
            </dd>
          </div>
          <div>
            <dt>Built on</dt>
            <dd>{builtOn}</dd>
          </div>
        </dl>
      </header>
      {Demo ? (
        <div className="card-stage" data-register={item.register}>
          <Demo />
        </div>
      ) : null}
      <CopyCommand
        label={`Copy the ${item.title} install command`}
        text={installCommand(item.name)}
      />
    </article>
  );
};
