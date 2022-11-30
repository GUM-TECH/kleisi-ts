import { Option, None } from '../option/index';
import { Result, Err } from '../result/index';

interface Match<T, E, A, B> {
  Some?: (_: T) => A;
  None?: () => B;
  Ok?: (_: T) => A;
  Err?: (_: E) => B;
}

export const flatten = <A>(
  t: Option<A> | Result<A, A>
): Option<A> | Result<A, A> => {
  switch (t._tag) {
    case 'None':
      return None;
    case 'Some':
      return ((t.unwrap() as unknown) as Option<A>).hasOwnProperty('_tag')
        ? flatten((t.unwrap() as unknown) as Option<A>)
        : t;
    case 'Ok':
      return ((t.unwrap() as unknown) as Result<A, A>).hasOwnProperty('_tag')
        ? flatten((t.unwrap() as unknown) as Result<A, A>)
        : t;
    case 'Err':
      return Err(t?.value);
    default:
      return t;
  }
};

export const match = <T, E, A, B>(t: Option<T> | Result<T, E>) => ({
  Some: onSome,
  None: onNone,
  Ok: onOk,
  Err: onErr,
}: Match<T, E, A, B>): A | B | string => {
  switch (t._tag) {
    case 'None':
      return onNone?.() ?? 'No match defined for None';
    case 'Some':
      return onSome?.(t.unwrap()) ?? 'No match defined for Some';
    case 'Ok':
      return onOk?.(t.unwrap()) ?? 'No match defined for Ok';
    case 'Err':
      return onErr?.(t.unwrapErr()) ?? 'No match defined for Err';
    default:
      return (Err('No pattern matched') as unknown) as B;
  }
};
