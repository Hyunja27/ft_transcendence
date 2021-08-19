import { Resolver, Query, Mutation, Args, Int, Subscription } from '@nestjs/graphql';
import { PlayingInfoService } from './playing-info.service';
import { PlayingInfo } from './entities/playing-info.entity';
import { CreatePlayingInfoInput } from './dto/create-playing-info.input';
import { UpdatePlayingInfoInput } from './dto/update-playing-info.input';
import { PubSubProvider } from '../pub-sub/pub-sub.provider';

@Resolver(() => PlayingInfo)
export class PlayingInfoResolver {
  constructor(
    private readonly playingInfoService: PlayingInfoService,
    private readonly pubSubProvider: PubSubProvider,
  ) {}

  @Mutation(() => PlayingInfo)
  createPlayingInfo(@Args('createPlayingInfoInput') createPlayingInfoInput: CreatePlayingInfoInput) {
    return this.playingInfoService.create(createPlayingInfoInput);
  }

  // @Query(() => [PlayingInfo], { name: 'playingInfo' })
  // findAll() {
  //   return this.playingInfoService.findAll();
  // }

  // @Query(() => PlayingInfo, { name: 'playingInfo' })
  // findOne(@Args('index', { type: () => Int }) index: number) {
  //   return this.playingInfoService.findOne(index);
  // }

  // @Mutation(() => PlayingInfo)
  // removePlayingInfo(@Args('id', { type: () => Int }) id: number) {
  //   return this.playingInfoService.remove(id);
  // }

  @Mutation(() => PlayingInfo)
  async updatePlayingInfo(@Args('playingInfoInput') updatePlayingInfoInput: UpdatePlayingInfoInput) {
    const playingInfo = await this.playingInfoService.update(updatePlayingInfoInput.index, {
      ...updatePlayingInfoInput,
    });
    this.pubSubProvider.getPubSub().publish('playingInfo', {
      playingInfo: {
        ...playingInfo,
      },
    });
    return playingInfo;
  }

  async updateBall() {
    const updatePlayingInfo = await this.playingInfoService.update(1, null);
    this.pubSubProvider.getPubSub().publish('playingInfo', {
      playingInfo: updatePlayingInfo,
    });
  }

  // @Mutation(() => PlayingInfo)
  // async gameStart(@Args('playingInfoInput') updatePlayingInfoInput: UpdatePlayingInfoInput) {
  //   setInterval(() => this.updateBall(), 50);
  // }

  @Subscription((returns) => PlayingInfo, {
    filter: (payload, variables) => {
      return payload.playingInfo.uuid === variables.uuid;
    },
  })
  playingInfo(@Args('uuid') uuid: string) {
    setInterval(() => this.updateBall(), 100);
    return this.pubSubProvider.getPubSub().asyncIterator('playingInfo');
  }
}
